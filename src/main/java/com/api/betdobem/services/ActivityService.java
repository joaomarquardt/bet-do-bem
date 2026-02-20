package com.api.betdobem.services;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.domain.Group;
import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateActivityRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateActivityRequest;
import com.api.betdobem.dtos.responses.ActivityResponse;
import com.api.betdobem.dtos.responses.VotesByProof;
import com.api.betdobem.enums.ActivityStatus;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.events.ProofDecidedEvent;
import com.api.betdobem.exceptions.InvalidStatusException;
import com.api.betdobem.mappers.ActivityMapper;
import com.api.betdobem.repositories.ActivityRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.context.event.EventListener;
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

    public ActivityService(ActivityRepository activityRepository, ActivityMapper activityMapper, ProofService proofService, UserService userService, GroupService groupService, WalletService walletService) {
        this.activityRepository = activityRepository;
        this.activityMapper = activityMapper;
        this.proofService = proofService;
        this.userService = userService;
        this.groupService = groupService;
        this.walletService = walletService;
    }

    public List<ActivityResponse> getAllActivities() {
        List<Activity> activities = activityRepository.findAll();
        return activityMapper.toActivityResponseList(activities);
    }

    public List<Activity> getAllExpiredActivities() {
        Timestamp now = Timestamp.from(Instant.now());
        return activityRepository.findByStatusAndExpiresAtBefore(ActivityStatus.IN_JUDGMENT, now);
    }

    public List<ActivityResponse> getActivitiesRequiringVotingByUserId(Long userId) {
        List<Activity> activities = activityRepository.getActivitiesRequiringVotingByUserId(userId);
        return activityMapper.toActivityResponseList(activities);
    }

    public Activity getActivityEntityById(Long id) {
        return activityRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Activity with ID " + id + " not found."));
    }

    public ActivityResponse createActivity(CreateActivityRequest activity) {
        Activity activityEntity = activityMapper.toActivityEntity(activity);
        User author = userService.getUserEntityById(activity.authorId());
        Proof proof = proofService.createProof(activity.proof());
        Group group = groupService.getGroupEntityById(activity.groupId());
        activityEntity.setAuthor(author);
        activityEntity.setProof(proof);
        activityEntity.setGroup(group);
        activityEntity.setStatus(ActivityStatus.IN_JUDGMENT);
        Activity savedActivity = activityRepository.save(activityEntity);
        return activityMapper.toActivityResponse(savedActivity);
    }

    public ActivityResponse addProofToActivity(Long id, CreateProofRequest proof) {
        Activity activity = getActivityEntityById(id);
        if (activity.getStatus() != ActivityStatus.IN_JUDGMENT) {
            throw new InvalidStatusException("Cannot add proof to an activity that is not in judgment.");
        }
        Proof proofEntity = proofService.createProof(proof);
        activity.setProof(proofEntity);
        Activity updatedActivity = activityRepository.save(activity);
        return activityMapper.toActivityResponse(updatedActivity);
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
