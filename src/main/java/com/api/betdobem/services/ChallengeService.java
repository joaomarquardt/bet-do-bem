package com.api.betdobem.services;

import com.api.betdobem.domain.Challenge;
import com.api.betdobem.domain.Proof;
import com.api.betdobem.dtos.requests.CreateChallengeRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateChallengeRequest;
import com.api.betdobem.dtos.responses.ChallengeResponse;
import com.api.betdobem.enums.ChallengeStatus;
import com.api.betdobem.mappers.ChallengeMapper;
import com.api.betdobem.repositories.ChallengeRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class ChallengeService {
    private ChallengeRepository challengeRepository;
    private ChallengeMapper challengeMapper;
    private ProofService proofService;

    public ChallengeService(ChallengeRepository challengeRepository, ChallengeMapper challengeMapper, UserService userService, ProofService proofService) {
        this.challengeRepository = challengeRepository;
        this.challengeMapper = challengeMapper;
        this.proofService = proofService;
    }

    public List<ChallengeResponse> getAllChallenges() {
        List<Challenge> challenges = challengeRepository.findAll();
        return challengeMapper.toChallengeResponseList(challenges);
    }

    public Challenge getChallengeEntityById(Long id) {
        return challengeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Challenge with ID " + id + " not found."));
    }

    public ChallengeResponse createChallenge(CreateChallengeRequest challenge) {
        if (challenge.challengerId().equals(challenge.challengedId())) {
            throw new IllegalArgumentException("Challenger and challenged cannot be the same user.");
        }
        Challenge challengeEntity = challengeMapper.toChallengeEntity(challenge);
        Challenge savedChallenge = challengeRepository.save(challengeEntity);
        return challengeMapper.toChallengeResponse(savedChallenge);
    }

    public ChallengeResponse addProofToChallenge(Long id, CreateProofRequest proof) {
        Challenge challenge = getChallengeEntityById(id);
        if (challenge.getStatus() != ChallengeStatus.OPEN) {
            throw new IllegalArgumentException("Cannot add proof to a challenge that is not open.");
        }
        if (!challenge.getChallenged().getId().equals(proof.authorId())) {
            throw new IllegalArgumentException("Only the challenged user can add proof to this challenge.");
        }
        Proof proofEntity = proofService.createProof(proof);
        challenge.setProof(proofEntity);
        return challengeMapper.toChallengeResponse(challenge);
    }

    public ChallengeResponse getChallengeById(Long id) {
        Challenge challenge = getChallengeEntityById(id);
        return challengeMapper.toChallengeResponse(challenge);
    }

    // Analyze if updateChallenge is necessary in the application context
    public ChallengeResponse updateChallenge(Long id, UpdateChallengeRequest challenge) {
        return null;
    }

    public void deleteChallenge(Long id) {
        challengeRepository.deleteById(id);
    }
}
