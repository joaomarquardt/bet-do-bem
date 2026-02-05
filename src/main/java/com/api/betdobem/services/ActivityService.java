package com.api.betdobem.services;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.domain.Group;
import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateActivityRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateActivityRequest;
import com.api.betdobem.dtos.responses.ActivityResponse;
import com.api.betdobem.enums.ActivityStatus;
import com.api.betdobem.mappers.ActivityMapper;
import com.api.betdobem.repositories.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {
    private ActivityRepository activityRepository;
    private ActivityMapper activityMapper;
    private ProofService proofService;
    private UserService userService;
    private GroupService groupService;

    public ActivityService(ActivityRepository activityRepository, ActivityMapper activityMapper, ProofService proofService, UserService userService, GroupService groupService) {
        this.activityRepository = activityRepository;
        this.activityMapper = activityMapper;
        this.proofService = proofService;
        this.userService = userService;
        this.groupService = groupService;
    }

    public List<ActivityResponse> getAllActivities() {
        List<Activity> activities = activityRepository.findAll();
        return activityMapper.toActivityResponseList(activities);
    }

    public Activity getActivityEntityById(Long id) {
        return activityRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Activity with ID " + id + " not found."));
    }

    public ActivityResponse createActivity(CreateActivityRequest activity) {
        Activity activityEntity = activityMapper.toActivityEntity(activity);
        User author = userService.getUserEntityById(activity.authorId());
        Proof proof = proofService.createProof(activity.proof());
        Group group = groupService.getGroupEntityById(activity.groupId());
        activityEntity.setAuthor(author);
        activityEntity.setProof(proof);
        activityEntity.setGroup(group);
        activityEntity.setStatus(ActivityStatus.OPENED);
        Activity savedActivity = activityRepository.save(activityEntity);
        return activityMapper.toActivityResponse(savedActivity);
    }

    public ActivityResponse addProofToActivity(Long id, CreateProofRequest proof) {
        Activity activity = getActivityEntityById(id);
        if (activity.getStatus() != ActivityStatus.OPENED) {
            throw new IllegalArgumentException("Cannot add proof to an activity that is not opened.");
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
}
