package com.api.betdobem.services;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.dtos.requests.ActivityRequest;
import com.api.betdobem.dtos.responses.ActivityResponse;
import com.api.betdobem.repositories.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {
    private ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public List<ActivityResponse> getAllActivities() {
        return null;
    }

    public ActivityResponse createActivity(ActivityRequest activity) {
        return null;
    }

    public ActivityResponse getActivityById(Long id) {
        return null;
    }

    public ActivityResponse updateActivity(Long id, ActivityRequest activity) {
        return null;
    }

    public void deleteActivity(Long id) {
    }
}
