package com.api.betdobem.services;

import com.api.betdobem.dtos.responses.*;
import com.api.betdobem.enums.BetStatus;
import com.api.betdobem.enums.ChallengeStatus;
import com.api.betdobem.enums.ContextType;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;

@Service
public class FeedService {
    private final BetService betService;
    private final ChallengeService challengeService;
    private final ActivityService activityService;
    private final CommentService commentService;

    public FeedService(BetService betService, ChallengeService challengeService, ActivityService activityService, CommentService commentService) {
        this.betService = betService;
        this.challengeService = challengeService;
        this.activityService = activityService;
        this.commentService = commentService;
    }

    public List<FeedItemResponse> getVotingFeed(Long userId) {
        List<FeedItemResponse> feedItems = new ArrayList<>();
        
        addFeedItems(feedItems, betService.getBetsRequiringVotingByUserId(userId), 
                ContextType.BET, BetResponse::id, BetResponse::createdAt);
        
        addFeedItems(feedItems, challengeService.getChallengesRequiringVotingByUserId(userId), 
                ContextType.CHALLENGE, ChallengeResponse::id, ChallengeResponse::createdAt);
        
        addFeedItems(feedItems, activityService.getActivitiesRequiringVotingByUserId(userId), 
                ContextType.ACTIVITY, ActivityResponse::id, ActivityResponse::createdAt);

        feedItems.sort(Comparator.comparing(FeedItemResponse::createdAt).reversed());
        return feedItems;
    }

    public List<FeedItemResponse> getPendingInvites(Long userId) {
        List<FeedItemResponse> feedItems = new ArrayList<>();
        
        addFeedItems(feedItems, betService.getBetsByStatusAndOpponentId(BetStatus.INVITED, userId), 
                ContextType.BET, BetResponse::id, BetResponse::createdAt);
        
        addFeedItems(feedItems, challengeService.getChallengesByStatusAndChallengedId(ChallengeStatus.INVITED, userId), 
                ContextType.CHALLENGE, ChallengeResponse::id, ChallengeResponse::createdAt);

        feedItems.sort(Comparator.comparing(FeedItemResponse::createdAt).reversed());
        return feedItems;
    }

    public List<FeedItemResponse> getInProgressItems(Long userId) {
        List<FeedItemResponse> feedItems = new ArrayList<>();
        
        List<BetStatus> betStatuses = List.of(BetStatus.IN_PROGRESS, BetStatus.IN_JUDGMENT);
        addFeedItems(feedItems, betService.getBetsByStatusesAndInvolvedUserId(betStatuses, userId), 
                ContextType.BET, BetResponse::id, BetResponse::createdAt);

        List<ChallengeStatus> challengeStatuses = List.of(ChallengeStatus.IN_PROGRESS, ChallengeStatus.IN_JUDGMENT);
        addFeedItems(feedItems, challengeService.getChallengesByStatusesAndInvolvedUserId(challengeStatuses, userId), 
                ContextType.CHALLENGE, ChallengeResponse::id, ChallengeResponse::createdAt);

        feedItems.sort(Comparator.comparing(FeedItemResponse::createdAt).reversed());
        return feedItems;
    }

    public List<FeedItemResponse> getWaitingOpponentAcceptanceItems(Long userId) {
        List<FeedItemResponse> feedItems = new ArrayList<>();

        addFeedItems(feedItems, betService.getBetsByStatusAndCreatorId(BetStatus.INVITED, userId),
                ContextType.BET, BetResponse::id, BetResponse::createdAt);

        addFeedItems(feedItems, challengeService.getChallengesByStatusAndChallengerId(ChallengeStatus.INVITED, userId),
                ContextType.CHALLENGE, ChallengeResponse::id, ChallengeResponse::createdAt);

        feedItems.sort(Comparator.comparing(FeedItemResponse::createdAt).reversed());
        return feedItems;
    }

    private <T> void addFeedItems(List<FeedItemResponse> feedItems, List<T> items, ContextType type, 
                                  Function<T, Long> idExtractor, Function<T, Timestamp> dateExtractor) {
        for (T item : items) {
            Long itemId = idExtractor.apply(item);
            PagedResponse<CommentResponse> comments = commentService.getComments(type, itemId, Pageable.ofSize(5));
            feedItems.add(new FeedItemResponse(
                    itemId,
                    type,
                    dateExtractor.apply(item).toLocalDateTime(),
                    item,
                    comments
            ));
        }
    }
}
