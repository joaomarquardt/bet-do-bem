package com.api.betdobem.services;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.dtos.requests.CreateActivityRequest;
import com.api.betdobem.dtos.requests.UpdateActivityRequest;
import com.api.betdobem.dtos.responses.ActivityResponse;
import com.api.betdobem.mappers.ActivityMapper;
import com.api.betdobem.repositories.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {
    private ActivityRepository activityRepository;
    private ActivityMapper activityMapper;

    public ActivityService(ActivityRepository activityRepository, ActivityMapper activityMapper) {
        this.activityRepository = activityRepository;
        this.activityMapper = activityMapper;
    }

    public List<ActivityResponse> getAllActivities() {
        List<Activity> activities = activityRepository.findAll();
        return activityMapper.toActivityResponseList(activities);
    }

    public ActivityResponse createActivity(CreateActivityRequest activity) {
        return null;
    }

    public ActivityResponse getActivityById(Long id) {
        return null;
    }

    public ActivityResponse updateActivity(Long id, UpdateActivityRequest activity) {
        return null;
    }

    public void deleteActivity(Long id) {
    }
}
