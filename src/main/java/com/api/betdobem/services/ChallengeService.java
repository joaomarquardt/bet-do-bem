package com.api.betdobem.services;

import com.api.betdobem.domain.Challenge;
import com.api.betdobem.repositories.ChallengeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChallengeService {
    private ChallengeRepository challengeRepository;

    public ChallengeService(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    public List<Challenge> getAllChallenges() {
        return null;
    }

    public Challenge createChallenge(Challenge challenge) {
        return null;
    }

    public Challenge getChallengeById(Long id) {
        return null;
    }

    public Challenge updateChallenge(Long id, Challenge challenge) {
        return null;
    }

    public void deleteChallenge(Long id) {
    }
}
