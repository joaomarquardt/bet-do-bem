package com.api.betdobem.schedulers;

import com.api.betdobem.domain.Challenge;
import com.api.betdobem.services.ChallengeService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpirationScheduler {
    private final ChallengeService challengeService;

    public ExpirationScheduler(ChallengeService challengeService) {
        this.challengeService = challengeService;
     }

    @Scheduled(fixedRate = 60000) // Executes every minute
    public void closeExpiredChallenges() {
        List<Challenge> expiredChallenges = challengeService.getAllExpiredChallenges();
        for (Challenge challenge : expiredChallenges) {
            try {
                challengeService.handleExpiredChallenge(challenge);
            } catch (Exception e) {
                System.err.println("Error handling expired challenge with ID " + challenge.getId() + ": " + e.getMessage());
            }
        }
    }
}
