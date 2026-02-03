package com.api.betdobem.services;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.repositories.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {
    private ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public List<Activity> getAllActivities() {
        return null;
    }

    public Activity createActivity(Activity activity) {
        return null;
    }

    public Activity getActivityById(Long id) {
        return null;
    }

    public Activity updateActivity(Long id, Activity activity) {
        return null;
    }

    public void deleteActivity(Long id) {
    }
}
