package com.api.betdobem.services;

import com.api.betdobem.domain.*;
import com.api.betdobem.dtos.requests.CreateChallengeRequest;
import com.api.betdobem.dtos.requests.CreateCommentRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateChallengeRequest;
import com.api.betdobem.dtos.responses.*;
import com.api.betdobem.enums.ChallengeStatus;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.events.ProofDecidedEvent;
import com.api.betdobem.infra.exceptions.*;
import com.api.betdobem.mappers.ChallengeMapper;
import com.api.betdobem.repositories.ChallengeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Pageable;
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
    private CommentService commentService;

    @Value("${app.challenge.buy-cost}")
    private Long challengeBuyCost;

    @Value("${app.challenge.minimum-interval-days-invite-and-deadline}")
    private Long minimumIntervalDaysBetweenInviteAndDeadline;

    public ChallengeService(ChallengeRepository challengeRepository, ChallengeMapper challengeMapper, UserService userService, ProofService proofService, GroupService groupService, WalletService walletService, S3StorageService s3StorageService, CommentService commentService) {
        this.challengeRepository = challengeRepository;
        this.challengeMapper = challengeMapper;
        this.proofService = proofService;
        this.userService = userService;
        this.groupService = groupService;
        this.walletService = walletService;
        this.s3StorageService = s3StorageService;
        this.commentService = commentService;
    }

    public List<ChallengeResponse> getAllChallenges() {
        List<Challenge> challenges = challengeRepository.findAll();
        return challengeMapper.toChallengeResponseList(challenges);
    }

    public List<Challenge> getAllExpiredDeadlineChallenges() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        return challengeRepository.findByStatusAndDeadlineBefore(ChallengeStatus.IN_PROGRESS, now);
    }

    public List<Challenge> getAllExpiredInviteChallenges() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        return challengeRepository.findByStatusAndInviteExpiresAtBefore(ChallengeStatus.INVITED, now);
    }

    public boolean existsById(Long id) {
        return challengeRepository.existsById(id);
    }

    @Transactional
    public CommentResponse addComment(Long challengeId, CreateCommentRequest comment, User loggedUser) {
        if (!challengeRepository.existsById(challengeId)) {
            throw new EntityNotFoundException("Challenge with ID " + challengeId + " not found.");
        }
        if (!challengeRepository.canUserViewChallenge(challengeId, loggedUser.getId())) {
            throw new ForbiddenActionException("User does not have access to comment on this challenge.");
        }
        Challenge challenge = getChallengeEntityById(challengeId);
        if (challenge.getStatus() != ChallengeStatus.IN_JUDGMENT) {
            throw new InvalidCommentException("Cannot comment on a challenge that is not in judgment.");
        }
        return commentService.addComment(ContextType.CHALLENGE, challengeId, comment.content(), loggedUser);
    }

    public PagedResponse<CommentResponse> getCommentsForChallenge(Long challengeId, int page, int size, User loggedUser) {
        if (!challengeRepository.existsById(challengeId)) {
            throw new EntityNotFoundException("Challenge with ID " + challengeId + " not found.");
        }
        if (!challengeRepository.canUserViewChallenge(challengeId, loggedUser.getId())) {
            throw new ForbiddenActionException("User cannot access the comments for this challenge.");
        }
        return commentService.getComments(ContextType.CHALLENGE, challengeId, Pageable.ofSize(size).withPage(page));
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

    public List<ChallengeResponse> getChallengesByStatusAndChallengerId(ChallengeStatus status, Long userId) {
        List<Challenge> challenges = challengeRepository.findByStatusAndChallengerId(status, userId);
        return challengeMapper.toChallengeResponseList(challenges);
    }

    public Challenge getChallengeEntityById(Long id) {
        return challengeRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Challenge with ID " + id + " not found."));
    }

    @Transactional
    public void purchaseChallengeOption(Long userId) {
        User user = userService.getUserEntityById(userId);
        if (user.isHasBoughtChallenge()) {
            throw new ForbiddenActionException("User already has the right to create a challenge.");
        }
        walletService.buyChallengeOption(user, challengeBuyCost);
        user.setHasBoughtChallenge(true);
    }

    @Transactional
    public ChallengeResponse createChallenge(CreateChallengeRequest challenge, Long userId) {
        if (userId.equals(challenge.challengedId())) {
            throw new SelfInteractionException("Challenger and challenged cannot be the same user.");
        }
        if (challenge.inviteExpiresAt().after(challenge.deadline())) {
            throw new InvalidDateException("Invite expiration date must be before the challenge deadline.");
        }
        long daysBetweenInviteAndDeadline = (challenge.deadline().getTime() - challenge.inviteExpiresAt().getTime()) / (1000 * 60 * 60 * 24);
        if (daysBetweenInviteAndDeadline < minimumIntervalDaysBetweenInviteAndDeadline) {
            throw new InvalidDateException("The interval between invite expiration and challenge deadline must be at least " + minimumIntervalDaysBetweenInviteAndDeadline + " days.");
        }
        User challenger = userService.getUserEntityById(userId);
        if (!challenger.isHasBoughtChallenge()) {
            throw new ForbiddenActionException("User must buy the right to create a challenge first.");
        }
        challenger.setHasBoughtChallenge(false);
        Group group = groupService.getGroupEntityById(challenge.groupId());
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

    @Transactional
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

    @Transactional
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
        walletService.returnsFundsForExpiredOrDeclinedChallenge(challenge);
        return challengeMapper.toChallengeResponse(challenge);
    }

    @Transactional
    public ProofUploadResponse addProofToChallenge(Long id, CreateProofRequest proof, Long userId) {
        Challenge challenge = getChallengeEntityById(id);
        if (challenge.getStatus() != ChallengeStatus.IN_PROGRESS) {
            throw new InvalidStatusException("Cannot add proof to a challenge that is not open.");
        }
        if (!challenge.getChallenged().getId().equals(userId)) {
            throw new ForbiddenActionException("Only the challenged user can add proof to this challenge.");
        }
        if (challenge.getProof() != null) {
            throw new ProofAlreadySentException("A proof has already been submitted for this challenge.");
        }
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

    @Transactional
    public void deleteChallenge(Long id) {
        challengeRepository.deleteById(id);
    }

    @EventListener
    @Transactional
    public void handleProofDecision(ProofDecidedEvent event) {
        if (event.contextType() != ContextType.CHALLENGE) return;
        Challenge challenge = challengeRepository.findByProofId(event.proofId()).orElseThrow(() -> new EntityNotFoundException("Challenge associated with proof ID " + event.proofId() + " not found."));
        if (challenge.getStatus() != ChallengeStatus.IN_JUDGMENT) return;
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
    public void handleExpiredDeadlineChallenge(Challenge challenge) {
        if (challenge.getStatus() != ChallengeStatus.IN_PROGRESS) return;
        challenge.setStatus(ChallengeStatus.EXPIRED);
        challenge.setClosedAt(Timestamp.from(Instant.now()));
        challengeRepository.save(challenge);
        walletService.payChallengeWinner(challenge.getChallenger(), challenge);
    }

    @Transactional
    public void handleExpiredInviteChallenge(Challenge challenge) {
        if (challenge.getStatus() != ChallengeStatus.INVITED) return;
        challenge.setStatus(ChallengeStatus.EXPIRED);
        challenge.setClosedAt(Timestamp.from(Instant.now()));
        challengeRepository.save(challenge);
        walletService.returnsFundsForExpiredOrDeclinedChallenge(challenge);
    }
}
