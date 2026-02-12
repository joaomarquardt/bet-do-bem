package com.api.betdobem.services;

import com.api.betdobem.domain.Challenge;
import com.api.betdobem.domain.Group;
import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateChallengeRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateChallengeRequest;
import com.api.betdobem.dtos.responses.ChallengeResponse;
import com.api.betdobem.enums.ChallengeStatus;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.events.ProofDecidedEvent;
import com.api.betdobem.mappers.ChallengeMapper;
import com.api.betdobem.repositories.ChallengeRepository;
import jakarta.transaction.Transactional;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class ChallengeService {
    private ChallengeRepository challengeRepository;
    private ChallengeMapper challengeMapper;
    private ProofService proofService;
    private UserService userService;
    private GroupService groupService;
    private WalletService walletService;

    public ChallengeService(ChallengeRepository challengeRepository, ChallengeMapper challengeMapper, UserService userService, ProofService proofService, GroupService groupService, WalletService walletService) {
        this.challengeRepository = challengeRepository;
        this.challengeMapper = challengeMapper;
        this.proofService = proofService;
        this.userService = userService;
        this.groupService = groupService;
        this.walletService = walletService;
    }

    public List<ChallengeResponse> getAllChallenges() {
        List<Challenge> challenges = challengeRepository.findAll();
        return challengeMapper.toChallengeResponseList(challenges);
    }

    public List<Challenge> getAllExpiredChallenges() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        return challengeRepository.findByStatusAndDeadlineBefore(ChallengeStatus.IN_PROGRESS, now);
    }

    public List<ChallengeResponse> getChallengesRequiringVotingByUserId(Long userId) {
        List<Challenge> challenges = challengeRepository.getChallengesRequiringVotingByUserId(userId);
        return challengeMapper.toChallengeResponseList(challenges);
    }

    public Challenge getChallengeEntityById(Long id) {
        return challengeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Challenge with ID " + id + " not found."));
    }

    public ChallengeResponse createChallenge(CreateChallengeRequest challenge) {
        if (challenge.challengerId().equals(challenge.challengedId())) {
            throw new IllegalArgumentException("Challenger and challenged cannot be the same user.");
        }
        Group group = groupService.getGroupEntityById(challenge.groupId());
        User challenger = userService.getUserEntityById(challenge.challengerId());
        User challenged = userService.getUserEntityById(challenge.challengedId());
        Challenge challengeEntity = challengeMapper.toChallengeEntity(challenge);
        challengeEntity.setChallenger(challenger);
        challengeEntity.setChallenged(challenged);
        challengeEntity.setGroup(group);
        challengeEntity.setStatus(ChallengeStatus.INVITED);
        Challenge savedChallenge = challengeRepository.save(challengeEntity);
        walletService.holdsFundsForCreatedChallenge(savedChallenge);
        return challengeMapper.toChallengeResponse(savedChallenge);
    }

    public ChallengeResponse acceptChallenge(Long id) {
        // TODO: Only the challenged should be able to accept the challenge, need to add authentication and authorization
        Challenge challenge = getChallengeEntityById(id);
        if (challenge.getStatus() != ChallengeStatus.INVITED) {
            throw new IllegalArgumentException("Only challenges with status 'INVITED' can be accepted.");
        }
        challenge.setStatus(ChallengeStatus.IN_PROGRESS);
        challengeRepository.save(challenge);
        walletService.holdsFundsForAcceptedChallenge(challenge);
        return challengeMapper.toChallengeResponse(challenge);
    }

    public ChallengeResponse declineChallenge(Long id) {
        // TODO: Only the challenged should be able to decline the challenge, need to add authentication and authorization
        Challenge challenge = getChallengeEntityById(id);
        if (challenge.getStatus() != ChallengeStatus.INVITED) {
            throw new IllegalArgumentException("Only challenges with status 'INVITED' can be declined.");
        }
        challenge.setStatus(ChallengeStatus.DECLINED);
        challenge.setClosedAt(Timestamp.from(Instant.now()));
        challengeRepository.save(challenge);
        walletService.returnsFundsForDeclinedChallenge(challenge);
        return challengeMapper.toChallengeResponse(challenge);
    }

    public ChallengeResponse addProofToChallenge(Long id, CreateProofRequest proof) {
        Challenge challenge = getChallengeEntityById(id);
        if (challenge.getStatus() != ChallengeStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Cannot add proof to a challenge that is not open.");
        }
        if (!challenge.getChallenged().getId().equals(proof.authorId())) {
            throw new IllegalArgumentException("Only the challenged user can add proof to this challenge.");
        }
        Proof proofEntity = proofService.createProof(proof);
        challenge.setProof(proofEntity);
        challenge.setStatus(ChallengeStatus.IN_JUDGMENT);
        challengeRepository.save(challenge);
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

    @EventListener
    @Transactional
    public void handleProofDecision(ProofDecidedEvent event) {
        if (event.contextType() != ContextType.CHALLENGE) return;
        Challenge challenge = challengeRepository.findByProofId(event.proofId()).orElseThrow(() -> new IllegalArgumentException("Challenge associated with proof ID " + event.proofId() + " not found."));
        if (challenge.getStatus() != ChallengeStatus.IN_JUDGMENT && challenge.getStatus() != ChallengeStatus.IN_PROGRESS) return;
        if (event.approved()) {
            walletService.payChallengeWinner(challenge.getChallenged(), challenge);
            challenge.setStatus(ChallengeStatus.SUCCESS);
        } else {
            walletService.payChallengeWinner(challenge.getChallenger(), challenge);
            challenge.setStatus(ChallengeStatus.FAILED);
        }
        challenge.setClosedAt(Timestamp.from(Instant.now()));
        challengeRepository.save(challenge);
    }

    @Transactional
    public void handleExpiredChallenge(Challenge challenge) {
        if (challenge.getStatus() != ChallengeStatus.IN_PROGRESS) return;
        walletService.payChallengeWinner(challenge.getChallenger(), challenge);
        challenge.setStatus(ChallengeStatus.EXPIRED);
        challenge.setClosedAt(Timestamp.from(Instant.now()));
        challengeRepository.save(challenge);
    }
}
