package com.api.betdobem.controllers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.responses.FeedItemResponse;
import com.api.betdobem.dtos.responses.FeedItemWithPercentageResponse;
import com.api.betdobem.dtos.responses.UserCreationRights;
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

    @GetMapping("/me/home")
    public ResponseEntity<List<FeedItemResponse>> getMyFeed(@AuthenticationPrincipal User loggedUser) {
        List<FeedItemResponse> feedItems = feedService.getVotingFeed(loggedUser.getId());
        return new ResponseEntity<>(feedItems, HttpStatus.OK);
    }

    @GetMapping("/me/stats-before-create")
    public ResponseEntity<UserCreationRights> getStatsBeforeCreate(@AuthenticationPrincipal User loggedUser) {
        UserCreationRights stats = feedService.getStatsBeforeCreate(loggedUser.getId());
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }

    @GetMapping("/me/pending-invites")
    public ResponseEntity<List<FeedItemResponse>> getMyPendingInvites(@AuthenticationPrincipal User loggedUser) {
        List<FeedItemResponse> pendingInvites = feedService.getPendingInvites(loggedUser.getId());
        return new ResponseEntity<>(pendingInvites, HttpStatus.OK);
    }

    @GetMapping("/me/in-progress-items")
    public ResponseEntity<List<FeedItemWithPercentageResponse>> getMyInProgressItems(@AuthenticationPrincipal User loggedUser) {
        List<FeedItemWithPercentageResponse> inProgressItems = feedService.getInProgressItems(loggedUser.getId());
        return new ResponseEntity<>(inProgressItems, HttpStatus.OK);
    }

    @GetMapping("/me/waiting-opponent-acceptance")
    public ResponseEntity<List<FeedItemResponse>> getMyWaitingOpponentAcceptanceItems(@AuthenticationPrincipal User loggedUser) {
        List<FeedItemResponse> waitingAcceptanceItems = feedService.getWaitingOpponentAcceptanceItems(loggedUser.getId());
        return new ResponseEntity<>(waitingAcceptanceItems, HttpStatus.OK);
    }
}
