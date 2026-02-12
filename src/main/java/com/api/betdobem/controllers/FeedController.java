package com.api.betdobem.controllers;

import com.api.betdobem.dtos.responses.FeedItemResponse;
import com.api.betdobem.services.FeedService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feed")
public class FeedController {
    private final FeedService feedService;

    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    @GetMapping("/home/{userId}")
    public ResponseEntity<List<FeedItemResponse>> getMyFeed(@PathVariable(value = "userId") Long userId) {
        List<FeedItemResponse> feedItems = feedService.getVotingFeed(userId);
        return new ResponseEntity<>(feedItems, HttpStatus.OK);
    }
}
