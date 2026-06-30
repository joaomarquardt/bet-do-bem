package com.api.betdobem.services;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.domain.Group;
import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateActivityRequest;
import com.api.betdobem.dtos.requests.CreateCommentRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateActivityRequest;
import com.api.betdobem.dtos.responses.*;
import com.api.betdobem.enums.ActivityStatus;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.events.ProofDecidedEvent;
import com.api.betdobem.infra.exceptions.UnauthorizedActionException;
import com.api.betdobem.mappers.ActivityMapper;
import com.api.betdobem.repositories.ActivityRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class ActivityService {
    private ActivityRepository activityRepository;
    private ActivityMapper activityMapper;
    private ProofService proofService;
    private UserService userService;
    private GroupService groupService;
    private WalletService walletService;
    private S3StorageService s3StorageService;
    private CommentService commentService;

    public ActivityService(ActivityRepository activityRepository, ActivityMapper activityMapper, ProofService proofService, UserService userService, GroupService groupService, WalletService walletService, S3StorageService s3StorageService, CommentService commentService) {
        this.activityRepository = activityRepository;
        this.activityMapper = activityMapper;
        this.proofService = proofService;
        this.userService = userService;
        this.groupService = groupService;
        this.walletService = walletService;
        this.s3StorageService = s3StorageService;
        this.commentService = commentService;
    }

    public List<ActivityResponse> getAllActivities() {
        List<Activity> activities = activityRepository.findAll();
        return activityMapper.toActivityResponseList(activities);
    }

    public List<Activity> getAllExpiredActivities() {
        Timestamp now = Timestamp.from(Instant.now());
        return activityRepository.findByStatusAndExpiresAtBefore(ActivityStatus.IN_JUDGMENT, now);
    }

    public boolean existsById(Long id) {
        return activityRepository.existsById(id);
    }

    public CommentResponse addComment(Long activityId, CreateCommentRequest comment, User loggedUser) {
        if (!activityRepository.existsById(activityId)) {
            throw new EntityNotFoundException("Activity with ID " + activityId + " not found.");
        }
        if (!activityRepository.canUserViewActivity(activityId, loggedUser.getId())) {
                throw new UnauthorizedActionException("User does not have access to comment on this activity.");
        }
        return commentService.addComment(ContextType.ACTIVITY, activityId, comment.content(), loggedUser);
    }

    public PagedResponse<CommentResponse> getCommentsForActivity(Long activityId, int page, int size, User loggedUser) {
        if (!activityRepository.existsById(activityId)) {
            throw new EntityNotFoundException("Activity with ID " + activityId + " not found.");
        }
        if (!activityRepository.canUserViewActivity(activityId, loggedUser.getId())) {
            throw new UnauthorizedActionException("User cannot access the comments for this activity.");
        }
        return commentService.getComments(ContextType.ACTIVITY, activityId, Pageable.ofSize(size).withPage(page));
    }

    public List<ActivityResponse> getActivitiesRequiringVotingByUserId(Long userId) {
        List<Activity> activities = activityRepository.getActivitiesRequiringVotingByUserId(userId);
        return activityMapper.toActivityResponseList(activities);
    }

    public Activity getActivityEntityById(Long id) {
        return activityRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Activity with ID " + id + " not found."));
    }

    public List<ActivityResponse> getActivitiesByStatusesAndInvolvedUserId(List<ActivityStatus> statuses, Long userId) {
        List<Activity> activities = activityRepository.findByStatusesAndInvolvedUserId(statuses, userId);
        return activityMapper.toActivityResponseList(activities);
    }

    @Transactional
    public CreatedActivityResponse createActivity(CreateActivityRequest activity, Long userId) {
        Activity activityEntity = activityMapper.toActivityEntity(activity);
        User author = userService.getUserEntityById(userId);
        String uniqueObjectKey = String.format("proofs/activities/user_%d_%d_%s",
                userId,
                System.currentTimeMillis(),
                activity.proof().fileName().replaceAll("[^a-zA-Z0-9.-]", "_"));
        CreateProofRequest proofUpdated = new CreateProofRequest(activity.proof().fileName(), activity.proof().contentType(), uniqueObjectKey);
        Proof proofEntity = proofService.createProof(proofUpdated, userId);
        Group group = groupService.getGroupEntityById(activity.groupId());
        activityEntity.setAuthor(author);
        activityEntity.setProof(proofEntity);
        activityEntity.setGroup(group);
        activityEntity.setStatus(ActivityStatus.IN_JUDGMENT);
        Activity savedActivity = activityRepository.save(activityEntity);
        String uploadUrl = s3StorageService.generatePresignedUploadUrl(uniqueObjectKey, activity.proof().contentType());
        ActivityResponse activityResponse = activityMapper.toActivityResponse(savedActivity);
        return new CreatedActivityResponse(activityResponse, uploadUrl);
    }

    public ActivityResponse getActivityById(Long id) {
        Activity activity = getActivityEntityById(id);
        return activityMapper.toActivityResponse(activity);
    }

    public ActivityResponse updateActivity(Long id, UpdateActivityRequest activity) {
        Activity existingActivity = getActivityEntityById(id);
        activityMapper.updateActivityRequest(activity, existingActivity);
        Activity updatedActivity = activityRepository.save(existingActivity);
        return activityMapper.toActivityResponse(updatedActivity);
    }

    public void deleteActivity(Long id) {
        activityRepository.deleteById(id);
    }

    @EventListener
    @Transactional
    public void handleProofDecision(ProofDecidedEvent event) {
        if (event.contextType() != ContextType.ACTIVITY) return;
        Activity activity = activityRepository.findByProofId(event.proofId()).orElseThrow(() -> new EntityNotFoundException("Activity associated with proof ID " + event.proofId() + " not found."));
        if (activity.getStatus() != ActivityStatus.IN_JUDGMENT) return;
        if (event.approved()) {
            activity.setStatus(ActivityStatus.APPROVED);
            walletService.payActivityReward(activity);
        } else {
            activity.setStatus(ActivityStatus.REJECTED);
        }
        activity.setClosedAt(Timestamp.from(Instant.now()));
        activityRepository.save(activity);
    }

    public void handleExpiredActivity(Activity activity) {
        if (activity.getStatus() != ActivityStatus.IN_JUDGMENT) return;
        VotesByProof proofVotes = proofService.countVotesByProofId(activity.getProof().getId());
        long approvedVotes = proofVotes.approvedVotes();
        long rejectedVotes = proofVotes.rejectedVotes();
        if (approvedVotes > rejectedVotes) {
            activity.setStatus(ActivityStatus.APPROVED);
            walletService.payActivityReward(activity);
        } else if (approvedVotes == 0 && rejectedVotes == 0) {
            activity.setStatus(ActivityStatus.EXPIRED);
        } else {
            activity.setStatus(ActivityStatus.REJECTED);
        }
        activityRepository.save(activity);
    }
}
