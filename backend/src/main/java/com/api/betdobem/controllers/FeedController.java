package com.api.betdobem.controllers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.responses.FeedItemResponse;
import com.api.betdobem.services.FeedService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
public class FeedController {
    private final FeedService feedService;

    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    @GetMapping("/home/me")
    public ResponseEntity<List<FeedItemResponse>> getMyFeed(@AuthenticationPrincipal User loggedUser) {
        List<FeedItemResponse> feedItems = feedService.getVotingFeed(loggedUser.getId());
        return new ResponseEntity<>(feedItems, HttpStatus.OK);
    }

    @GetMapping("/pending-invites/me")
    public ResponseEntity<List<FeedItemResponse>> getMyPendingInvites(@AuthenticationPrincipal User loggedUser) {
        List<FeedItemResponse> pendingInvites = feedService.getPendingInvites(loggedUser.getId());
        return new ResponseEntity<>(pendingInvites, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<FeedItemResponse>> getMyInProgressItems(@AuthenticationPrincipal User loggedUser) {
        List<FeedItemResponse> inProgressItems = feedService.getInProgressItems(loggedUser.getId());
        return new ResponseEntity<>(inProgressItems, HttpStatus.OK);
    }
}
