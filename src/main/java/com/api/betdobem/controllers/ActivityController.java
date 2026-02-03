package com.api.betdobem.controllers;

import com.api.betdobem.dtos.requests.CreateActivityRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateActivityRequest;
import com.api.betdobem.dtos.responses.ActivityResponse;
import com.api.betdobem.services.ActivityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activities")
public class ActivityController {
    private ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getAllActivities() {
        List<ActivityResponse> activities = activityService.getAllActivities();
        return new ResponseEntity<>(activities, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ActivityResponse> createActivity(@RequestBody @Valid CreateActivityRequest activity) {
        ActivityResponse newActivity = activityService.createActivity(activity);
        return new ResponseEntity<>(newActivity, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/proofs")
    public ResponseEntity<Void> addProofToActivity(@PathVariable Long id, @RequestBody @Valid CreateProofRequest proof) {
        activityService.addProofToActivity(id, proof);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityResponse> getActivityById(@PathVariable Long id) {
        ActivityResponse activity = activityService.getActivityById(id);
        return new ResponseEntity<>(activity, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityResponse> updateActivity(@PathVariable Long id, @RequestBody @Valid UpdateActivityRequest activity) {
        ActivityResponse updatedActivity = activityService.updateActivity(id, activity);
        return new ResponseEntity<>(updatedActivity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
