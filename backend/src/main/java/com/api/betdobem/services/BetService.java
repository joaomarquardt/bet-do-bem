package com.api.betdobem.services;

import com.api.betdobem.domain.*;
import com.api.betdobem.dtos.requests.CreateBetRequest;
import com.api.betdobem.dtos.requests.CreateCommentRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateBetRequest;
import com.api.betdobem.dtos.responses.*;
import com.api.betdobem.enums.BetStatus;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.events.ProofDecidedEvent;
import com.api.betdobem.events.ProofDrawEvent;
import com.api.betdobem.infra.exceptions.InvalidStatusException;
import com.api.betdobem.infra.exceptions.SelfInteractionException;
import com.api.betdobem.infra.exceptions.ForbiddenActionException;
import com.api.betdobem.mappers.BetMapper;
import com.api.betdobem.repositories.BetRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class BetService {
    private BetRepository betRepository;
    private BetMapper betMapper;
    private UserService userService;
    private ProofService proofService;
    private GroupService groupService;
    private WalletService walletService;
    private S3StorageService s3StorageService;
        private CommentService commentService;

    public BetService(BetRepository betRepository, BetMapper betMapper, UserService userService, ProofService proofService, GroupService groupService, WalletService walletService, S3StorageService s3StorageService, CommentService commentService) {
        this.betRepository = betRepository;
        this.betMapper = betMapper;
        this.userService = userService;
        this.proofService = proofService;
        this.groupService = groupService;
        this.walletService = walletService;
        this.s3StorageService = s3StorageService;
        this.commentService = commentService;
    }

    public List<BetResponse> getAllBets() {
        List<Bet> bets = betRepository.findAll();
        return betMapper.toBetResponseList(bets);
    }

    public List<Bet> getAllExpiredBets() {
        Timestamp now = Timestamp.from(Instant.now());
        return betRepository.findByStatusAndExpiresAtBefore(BetStatus.IN_JUDGMENT, now);
    }

    public boolean existsById(Long id) {
        return betRepository.existsById(id);
    }

    public CommentResponse addComment(Long betId, CreateCommentRequest comment, User loggedUser) {
        if (!betRepository.existsById(betId)) {
            throw new EntityNotFoundException("Bet with ID " + betId + " not found.");
        }
        if (!betRepository.canUserViewBet(betId, loggedUser.getId())) {
            throw new ForbiddenActionException("User does not have access to comment on this bet.");
        }
        return commentService.addComment(ContextType.BET, betId, comment.content(), loggedUser);
    }

    public PagedResponse<CommentResponse> getCommentsForBet(Long betId, int page, int size, User loggedUser) {
        if (!betRepository.existsById(betId)) {
            throw new EntityNotFoundException("Bet with ID " + betId + " not found.");
        }
        if (!betRepository.canUserViewBet(betId, loggedUser.getId())) {
            throw new ForbiddenActionException("User cannot access the comments for this bet.");
        }
        return commentService.getComments(ContextType.BET, betId, Pageable.ofSize(size).withPage(page));
    }

    public List<BetResponse> getBetsRequiringVotingByUserId(Long userId) {
        List<Bet> bets = betRepository.getBetsRequiringVotingByUserId(userId);
        return betMapper.toBetResponseList(bets);
    }

    public List<BetResponse> getBetsByStatusAndOpponentId(BetStatus status, Long userId) {
        List<Bet> bets = betRepository.findByStatusAndOpponentId(status, userId);
        return betMapper.toBetResponseList(bets);
    }

    public List<BetResponse> getBetsByStatusesAndInvolvedUserId(List<BetStatus> statuses, Long userId) {
        List<Bet> bets = betRepository.findByStatusesAndInvolvedUserId(statuses, userId);
        return betMapper.toBetResponseList(bets);
    }

    public List<BetResponse> getBetsByStatusAndCreatorId(BetStatus status, Long userId) {
        List<Bet> bets = betRepository.findByStatusAndCreatorId(status, userId);
        return betMapper.toBetResponseList(bets);
    }

    public BetResponse createBet(CreateBetRequest bet, Long userId) {
        if (userId.equals(bet.opponentId())) {
            throw new SelfInteractionException("Creator and opponent cannot be the same user.");
        }
        User creator = userService.getUserEntityById(userId);
        User opponent = userService.getUserEntityById(bet.opponentId());
        Group group = groupService.getGroupEntityById(bet.groupId());
        Bet betEntity = betMapper.toBetEntity(bet);
        betEntity.setStatus(BetStatus.INVITED);
        betEntity.setCreator(creator);
        betEntity.setOpponent(opponent);
        betEntity.setGroup(group);
        Bet savedBet = betRepository.save(betEntity);
        walletService.holdsFundsForCreatedBet(savedBet);
        return betMapper.toBetResponse(savedBet);
    }

    public BetResponse acceptBet(Long id, Long userId) {
        Bet bet = getBetEntityById(id);
        if (!bet.getOpponent().getId().equals(userId)) {
            throw new AccessDeniedException("Only the opponent can accept bet invite");
        }
        if (bet.getStatus() != BetStatus.INVITED) {
            throw new InvalidStatusException("Only bets with status 'INVITED' can be accepted.");
        }
        bet.setStatus(BetStatus.IN_PROGRESS);
        betRepository.save(bet);
        walletService.holdsFundsForAcceptedBet(bet);
        return betMapper.toBetResponse(bet);
    }

    public BetResponse declineBet(Long id, Long userId) {
        Bet bet = getBetEntityById(id);
        if (!bet.getOpponent().getId().equals(userId)) {
            throw new AccessDeniedException("Only the opponent can decline bet invite");
        }
        if (bet.getStatus() != BetStatus.INVITED) {
            throw new InvalidStatusException("Only bets with status 'INVITED' can be declined.");
        }
        bet.setStatus(BetStatus.DECLINED);
        betRepository.save(bet);
        walletService.returnsFundsForDeclinedBet(bet);
        return betMapper.toBetResponse(bet);
    }

    @Transactional
    public ProofUploadResponse addProofToBet(Long id, CreateProofRequest proof, Long userId) {
        Bet bet = getBetEntityById(id);
        if (!bet.getCreator().getId().equals(userId) && !bet.getOpponent().getId().equals(userId)) {
            throw new ForbiddenActionException("Only the creator or opponent can add proofs to this bet.");
        }
        if (bet.getStatus() != BetStatus.IN_PROGRESS) {
            throw new InvalidStatusException("Cannot add proof to a bet that is not in progress.");
        }
        // TODO: Check if user already posted a proof in this bet
        String uniqueObjectKey = String.format("proofs/bets/user_%d_%d_%s",
                userId,
                System.currentTimeMillis(),
                proof.fileName().replaceAll("[^a-zA-Z0-9.-]", "_"));
        CreateProofRequest proofUpdated = new CreateProofRequest(proof.fileName(), proof.contentType(), uniqueObjectKey);
        Proof proofEntity = proofService.createProof(proofUpdated, userId);
        bet.getProofs().add(proofEntity);
        if (bet.getProofs().size() >= 2) {
            bet.setStatus(BetStatus.IN_JUDGMENT);
        }
        betRepository.save(bet);
        String uploadUrl = s3StorageService.generatePresignedUploadUrl(uniqueObjectKey, proof.contentType());
        ProofResponse proofResponse = proofService.getProofById(proofEntity.getId());
        return new ProofUploadResponse(proofResponse, uploadUrl);
    }

    public Bet getBetEntityById(Long id) {
        return betRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Bet with ID " + id + " not found."));
    }

    public BetResponse getBetById(Long id) {
        Bet bet = getBetEntityById(id);
        return betMapper.toBetResponse(bet);
    }

    public BetResponse updateBet(Long id, UpdateBetRequest bet) {
        Bet existingBet = getBetEntityById(id);
        if (bet.creatorId().equals(bet.opponentId())) {
            throw new SelfInteractionException("Creator and opponent cannot be the same user.");
        }
        betMapper.updateBetRequest(bet, existingBet);
        return null;
    }

    public void deleteBet(Long id) {
        betRepository.deleteById(id);
    }

    @EventListener
    @Transactional
    public void handleProofDecision(ProofDecidedEvent event) {
        if (event.contextType() != ContextType.BET) return;
        if (!event.approved()) return;
        Bet bet = betRepository.findByProofId(event.proofId()).orElseThrow(() -> new EntityNotFoundException("Bet associated with proof ID " + event.proofId() + " not found."));
        if (bet.getStatus() != BetStatus.IN_JUDGMENT) return;
        Proof winningProof = bet.getProofs().stream().filter(p -> p.getId().equals(event.proofId())).findFirst().orElseThrow();
        User winner = winningProof.getAuthor();
        BetStatus betStatus = bet.getCreator().getId().equals(winner.getId()) ? BetStatus.FINISHED_WIN_CREATOR : BetStatus.FINISHED_WIN_OPPONENT;
        finishBetWinner(bet, betStatus, winner);
    }

    @Transactional
    public void finishBetWinner(Bet bet, BetStatus betStatus, User winner) {
        bet.setStatus(betStatus);
        walletService.payBetWinner(winner, bet);
        bet.setClosedAt(Timestamp.from(Instant.now()));
        betRepository.save(bet);
    }

    @Transactional
    @EventListener
    public void finishBetDraw(ProofDrawEvent event) {
        if (event.contextType() != ContextType.BET) return;
        Bet bet = betRepository.findByProofId(event.proofId()).orElseThrow(() -> new EntityNotFoundException("Bet associated with proof ID " + event.proofId() + " not found."));
        if (bet.getStatus() != BetStatus.IN_JUDGMENT && bet.getStatus() != BetStatus.IN_PROGRESS) return;
        bet.setStatus(BetStatus.FINISHED_DRAW);
        bet.setClosedAt(Timestamp.from(Instant.now()));
        betRepository.save(bet);
        walletService.returnsFundsForDrawnBet(bet);
    }

    @Transactional
    public void handleExpiredBet(Bet bet) {
        if (bet.getStatus() != BetStatus.IN_PROGRESS && bet.getStatus() != BetStatus.IN_JUDGMENT) return;
        Proof proofCreator = bet.getProofs().stream()
                .filter(p -> p.getAuthor().getId().equals(bet.getCreator().getId()))
                .findFirst()
                .orElse(null);
        Proof proofOpponent = bet.getProofs().stream()
                .filter(p -> p.getAuthor().getId().equals(bet.getOpponent().getId()))
                .findFirst()
                .orElse(null);
        long votesCreator = 0;
        if (proofCreator != null) {
            VotesByProof v = proofService.countVotesByProofId(proofCreator.getId());
            votesCreator = v.approvedVotes();
        }
        long votesOpponent = 0;
        if (proofOpponent != null) {
            VotesByProof v = proofService.countVotesByProofId(proofOpponent.getId());
            votesOpponent = v.approvedVotes();
        }
        if (votesCreator == votesOpponent) {
            bet.setStatus(BetStatus.FINISHED_DRAW);
            walletService.returnsFundsForDrawnBet(bet);
        }
        else if (votesCreator > votesOpponent) {
            bet.setStatus(BetStatus.FINISHED_WIN_CREATOR);
            walletService.payBetWinner(bet.getCreator(), bet);
        }
        else {
            bet.setStatus(BetStatus.FINISHED_WIN_OPPONENT);
            walletService.payBetWinner(bet.getOpponent(), bet);
        }
        bet.setClosedAt(Timestamp.from(Instant.now()));
        betRepository.save(bet);
    }
}
