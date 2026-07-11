package com.api.betdobem.schedulers;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.domain.Bet;
import com.api.betdobem.domain.Challenge;
import com.api.betdobem.domain.GroupInvite;
import com.api.betdobem.services.ActivityService;
import com.api.betdobem.services.BetService;
import com.api.betdobem.services.ChallengeService;
import com.api.betdobem.services.GroupInviteService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpirationScheduler {
    private final long EXPIRATION_CHECK_INTERVAL = 60000;
    private final ChallengeService challengeService;
    private final ActivityService activityService;
    private final BetService betService;
    private final GroupInviteService groupInviteService;

    public ExpirationScheduler(ChallengeService challengeService, ActivityService activityService, BetService betService, GroupInviteService groupInviteService) {
        this.challengeService = challengeService;
        this.activityService = activityService;
        this.betService = betService;
        this.groupInviteService = groupInviteService;
    }

    @Scheduled(fixedRate = EXPIRATION_CHECK_INTERVAL) // Executes every minute
    public void closeExpiredChallenges() {
        List<Challenge> expiredInviteChallenges = challengeService.getAllExpiredInviteChallenges();
        List<Challenge> expiredDeadlineChallenges = challengeService.getAllExpiredDeadlineChallenges();
        for (Challenge challenge : expiredInviteChallenges) {
            try {
                challengeService.handleExpiredInviteChallenge(challenge);
            } catch (Exception e) {
                System.err.println("Error handling expired invite challenge with ID " + challenge.getId() + ": " + e.getMessage());
            }
        }
        for (Challenge challenge : expiredDeadlineChallenges) {
            try {
                challengeService.handleExpiredDeadlineChallenge(challenge);
            } catch (Exception e) {
                System.err.println("Error handling expired deadline challenge with ID " + challenge.getId() + ": " + e.getMessage());
            }
        }
    }

    @Scheduled(fixedRate = EXPIRATION_CHECK_INTERVAL) // Executes every minute
    public void closeExpiredActivities() {
        List<Activity> expiredActivities = activityService.getAllExpiredActivities();
        for (Activity activity : expiredActivities) {
            try {
                activityService.handleExpiredActivity(activity);
            } catch (Exception e) {
                System.err.println("Error handling expired activity with ID " + activity.getId() + ": " + e.getMessage());
            }
        }
    }

    @Scheduled(fixedRate = EXPIRATION_CHECK_INTERVAL) // Executes every minute
    public void closeExpiredBets() {
        List<Bet> expiredInviteBets = betService.getAllExpiredInviteBets();
        List<Bet> expiredDeadlineBets = betService.getAllExpiredDeadlineBets();
        for (Bet bet : expiredInviteBets) {
            try {
                betService.handleExpiredInviteBet(bet);
            } catch (Exception e) {
                System.err.println("Error handling expired invite bet with ID " + bet.getId() + ": " + e.getMessage());
            }
        }
        for (Bet bet : expiredDeadlineBets) {
            try {
                betService.handleExpiredDeadlineBet(bet);
            } catch (Exception e) {
                System.err.println("Error handling expired deadline bet with ID " + bet.getId() + ": " + e.getMessage());
            }
        }
    }

    @Scheduled(fixedRate = EXPIRATION_CHECK_INTERVAL) // Executes every minute
    public void closeExpiredGroupInvites() {
        List<GroupInvite> expiredInvites = groupInviteService.getAllExpiredPendingInvites();
        for (GroupInvite invite : expiredInvites) {
            try {
                groupInviteService.handleExpiredInvite(invite);
            } catch (Exception e) {
                System.err.println("Error handling expired group invite with ID " + invite.getId() + ": " + e.getMessage());
            }
        }
    }
}
