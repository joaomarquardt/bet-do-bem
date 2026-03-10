package com.api.betdobem.services;

import com.api.betdobem.domain.*;
import com.api.betdobem.dtos.requests.CreateChallengeRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateChallengeRequest;
import com.api.betdobem.dtos.responses.ChallengeResponse;
import com.api.betdobem.dtos.responses.ProofResponse;
import com.api.betdobem.dtos.responses.ProofUploadResponse;
import com.api.betdobem.enums.ChallengeStatus;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.events.ProofDecidedEvent;
import com.api.betdobem.infra.exceptions.InvalidStatusException;
import com.api.betdobem.infra.exceptions.SelfInteractionException;
import com.api.betdobem.infra.exceptions.UnauthorizedActionException;
import com.api.betdobem.mappers.ChallengeMapper;
import com.api.betdobem.repositories.ChallengeRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.context.event.EventListener;
import org.springframework.security.access.AccessDeniedException;
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
    private S3StorageService s3StorageService;

    public ChallengeService(ChallengeRepository challengeRepository, ChallengeMapper challengeMapper, UserService userService, ProofService proofService, GroupService groupService, WalletService walletService, S3StorageService s3StorageService) {
        this.challengeRepository = challengeRepository;
        this.challengeMapper = challengeMapper;
        this.proofService = proofService;
        this.userService = userService;
        this.groupService = groupService;
        this.walletService = walletService;
        this.s3StorageService = s3StorageService;
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

    public List<ChallengeResponse> getChallengesByStatusAndChallengedId(ChallengeStatus status, Long userId) {
        List<Challenge> challenges = challengeRepository.findByStatusAndChallengedId(status, userId);
        return challengeMapper.toChallengeResponseList(challenges);
    }

    public List<ChallengeResponse> getChallengesByStatusesAndInvolvedUserId(List<ChallengeStatus> statuses, Long userId) {
        List<Challenge> challenges = challengeRepository.findByStatusesAndInvolvedUserId(statuses, userId);
        return challengeMapper.toChallengeResponseList(challenges);
    }

    public Challenge getChallengeEntityById(Long id) {
        return challengeRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Challenge with ID " + id + " not found."));
    }

    public ChallengeResponse createChallenge(CreateChallengeRequest challenge, Long userId) {
        if (userId.equals(challenge.challengedId())) {
            throw new SelfInteractionException("Challenger and challenged cannot be the same user.");
        }
        Group group = groupService.getGroupEntityById(challenge.groupId());
        User challenger = userService.getUserEntityById(userId);
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

    public ChallengeResponse acceptChallenge(Long id, Long userId) {
        Challenge challenge = getChallengeEntityById(id);
        if (!challenge.getChallenged().getId().equals(userId)) {
            throw new AccessDeniedException("Only the challenged can accept challenge invite");
        }
        if (challenge.getStatus() != ChallengeStatus.INVITED) {
            throw new InvalidStatusException("Only challenges with status 'INVITED' can be accepted.");
        }
        challenge.setStatus(ChallengeStatus.IN_PROGRESS);
        challengeRepository.save(challenge);
        walletService.holdsFundsForAcceptedChallenge(challenge);
        return challengeMapper.toChallengeResponse(challenge);
    }

    public ChallengeResponse declineChallenge(Long id, Long userId) {
        Challenge challenge = getChallengeEntityById(id);
        if (!challenge.getChallenged().getId().equals(userId)) {
            throw new AccessDeniedException("Only the challenged can decline challenge invite");
        }
        if (challenge.getStatus() != ChallengeStatus.INVITED) {
            throw new InvalidStatusException("Only challenges with status 'INVITED' can be declined.");
        }
        challenge.setStatus(ChallengeStatus.DECLINED);
        challenge.setClosedAt(Timestamp.from(Instant.now()));
        challengeRepository.save(challenge);
        walletService.returnsFundsForDeclinedChallenge(challenge);
        return challengeMapper.toChallengeResponse(challenge);
    }

    @Transactional
    public ProofUploadResponse addProofToChallenge(Long id, CreateProofRequest proof, Long userId) {
        Challenge challenge = getChallengeEntityById(id);
        if (challenge.getStatus() != ChallengeStatus.IN_PROGRESS) {
            throw new InvalidStatusException("Cannot add proof to a challenge that is not open.");
        }
        if (!challenge.getChallenged().getId().equals(userId)) {
            throw new UnauthorizedActionException("Only the challenged user can add proof to this challenge.");
        }
        // TODO: Check if user already posted a proof in this challenge
        String uniqueObjectKey = String.format("proofs/challenges/user_%d_%d_%s",
                userId,
                System.currentTimeMillis(),
                proof.fileName().replaceAll("[^a-zA-Z0-9.-]", "_"));
        CreateProofRequest proofUpdated = new CreateProofRequest(proof.fileName(), proof.contentType(), uniqueObjectKey);
        Proof proofEntity = proofService.createProof(proofUpdated, userId);
        challenge.setProof(proofEntity);
        challenge.setStatus(ChallengeStatus.IN_JUDGMENT);
        challengeRepository.save(challenge);
        String uploadUrl = s3StorageService.generatePresignedUploadUrl(uniqueObjectKey, proof.contentType());
        ProofResponse proofResponse = proofService.getProofById(proofEntity.getId());
        return new ProofUploadResponse(proofResponse, uploadUrl);
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
        Challenge challenge = challengeRepository.findByProofId(event.proofId()).orElseThrow(() -> new EntityNotFoundException("Challenge associated with proof ID " + event.proofId() + " not found."));
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
