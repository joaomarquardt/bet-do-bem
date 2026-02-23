package com.api.betdobem.services;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.domain.Bet;
import com.api.betdobem.domain.Challenge;
import com.api.betdobem.dtos.responses.ActivityResponse;
import com.api.betdobem.dtos.responses.BetResponse;
import com.api.betdobem.dtos.responses.ChallengeResponse;
import com.api.betdobem.dtos.responses.FeedItemResponse;
import com.api.betdobem.enums.ContextType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class FeedService {
    private final BetService betService;
    private final ChallengeService challengeService;
    private final ActivityService activityService;

    public FeedService(BetService betService, ChallengeService challengeService, ActivityService activityService) {
        this.betService = betService;
        this.challengeService = challengeService;
        this.activityService = activityService;
    }

    public List<FeedItemResponse> getVotingFeed(Long userId) {
        List<FeedItemResponse> feedItems = new ArrayList<>();
        List<BetResponse> betsRequiringVoting = betService.getBetsRequiringVotingByUserId(userId);
        for (BetResponse bet : betsRequiringVoting) {
            FeedItemResponse feedItem = new FeedItemResponse(
                    bet.id(), ContextType.BET,
                    bet.createdAt().toLocalDateTime(),
                    bet
            );
            feedItems.add(feedItem);
        }
        List<ChallengeResponse> challengesRequiringVoting = challengeService.getChallengesRequiringVotingByUserId(userId);
        for (ChallengeResponse challenge : challengesRequiringVoting) {
            FeedItemResponse feedItem = new FeedItemResponse(
                    challenge.id(), ContextType.CHALLENGE,
                    challenge.createdAt().toLocalDateTime(),
                    challenge
            );
            feedItems.add(feedItem);
        }
        List<ActivityResponse> activitiesRequiringVoting = activityService.getActivitiesRequiringVotingByUserId(userId);
        for (ActivityResponse activity : activitiesRequiringVoting) {
            FeedItemResponse feedItem = new FeedItemResponse(
                    activity.id(), ContextType.ACTIVITY,
                    activity.createdAt().toLocalDateTime(),
                    activity
            );
            feedItems.add(feedItem);
        }
        feedItems.sort(Comparator.comparing(FeedItemResponse::createdAt).reversed());
        return feedItems;
    }
}
