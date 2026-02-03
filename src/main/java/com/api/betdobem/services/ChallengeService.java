package com.api.betdobem.services;

import com.api.betdobem.domain.Challenge;
import com.api.betdobem.dtos.requests.ChallengeRequest;
import com.api.betdobem.dtos.responses.ChallengeResponse;
import com.api.betdobem.repositories.ChallengeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChallengeService {
    private ChallengeRepository challengeRepository;

    public ChallengeService(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    public List<ChallengeResponse> getAllChallenges() {
        return null;
    }

    public ChallengeResponse createChallenge(ChallengeRequest challenge) {
        return null;
    }

    public ChallengeResponse getChallengeById(Long id) {
        return null;
    }

    public ChallengeResponse updateChallenge(Long id, ChallengeRequest challenge) {
        return null;
    }

    public void deleteChallenge(Long id) {
    }
}
