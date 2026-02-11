package com.api.betdobem.services;

import com.api.betdobem.domain.Bet;
import com.api.betdobem.domain.Group;
import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateBetRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateBetRequest;
import com.api.betdobem.dtos.responses.BetResponse;
import com.api.betdobem.enums.BetStatus;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.events.ProofDecidedEvent;
import com.api.betdobem.events.ProofDrawEvent;
import com.api.betdobem.mappers.BetMapper;
import com.api.betdobem.repositories.BetRepository;
import jakarta.transaction.Transactional;
import org.springframework.context.event.EventListener;
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

    public BetService(BetRepository betRepository, BetMapper betMapper, UserService userService, ProofService proofService, GroupService groupService) {
        this.betRepository = betRepository;
        this.betMapper = betMapper;
        this.userService = userService;
        this.proofService = proofService;
        this.groupService = groupService;
    }

    public List<BetResponse> getAllBets() {
        List<Bet> bets = betRepository.findAll();
        return betMapper.toBetResponseList(bets);
    }

    public BetResponse createBet(CreateBetRequest bet) {
        if (bet.creatorId().equals(bet.opponentId())) {
            throw new IllegalArgumentException("Creator and opponent cannot be the same user.");
        }
        User creator = userService.getUserEntityById(bet.creatorId());
        User opponent = userService.getUserEntityById(bet.opponentId());
        Group group = groupService.getGroupEntityById(bet.groupId());
        Bet betEntity = betMapper.toBetEntity(bet);
        betEntity.setStatus(BetStatus.INVITED);
        betEntity.setCreator(creator);
        betEntity.setOpponent(opponent);
        betEntity.setGroup(group);
        Bet savedBet = betRepository.save(betEntity);
        return betMapper.toBetResponse(savedBet);
    }

    public BetResponse addProofToBet(Long id, CreateProofRequest proof) {
        Bet bet = getBetEntityById(id);
        if (!bet.getCreator().getId().equals(proof.authorId()) && !bet.getOpponent().getId().equals(proof.authorId())) {
            throw new IllegalArgumentException("Only the creator or opponent can add proofs to this bet.");
        }
        if (bet.getStatus() != BetStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Cannot add proof to a bet that is not in progress.");
        }
        Proof proofEntity = proofService.createProof(proof);
        bet.getProofs().add(proofEntity);
        betRepository.save(bet);
        return betMapper.toBetResponse(bet);
    }

    public Bet getBetEntityById(Long id) {
        return betRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Bet with ID " + id + " not found."));
    }

    public BetResponse getBetById(Long id) {
        Bet bet = getBetEntityById(id);
        return betMapper.toBetResponse(bet);
    }

    public BetResponse updateBet(Long id, UpdateBetRequest bet) {
        Bet existingBet = getBetEntityById(id);
        if (bet.creatorId().equals(bet.opponentId())) {
            throw new IllegalArgumentException("Creator and opponent cannot be the same user.");
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
        Bet bet = betRepository.findByProofId(event.proofId()).orElseThrow(() -> new IllegalArgumentException("Bet associated with proof ID " + event.proofId() + " not found."));
        if (bet.getStatus() != BetStatus.IN_JUDGMENT) return;
        Proof winningProof = bet.getProofs().stream().filter(p -> p.getId().equals(event.proofId())).findFirst().orElseThrow();
        User winner = winningProof.getAuthor();
        BetStatus betStatus = bet.getCreator().getId().equals(winner.getId()) ? BetStatus.FINISHED_WIN_CREATOR : BetStatus.FINISHED_WIN_OPPONENT;
        finishBetWinner(bet, betStatus, winner);
    }

    @Transactional
    public void finishBetWinner(Bet bet, BetStatus betStatus, User winner) {
        bet.setStatus(betStatus);
        bet.setClosedAt(Timestamp.from(Instant.now()));
        betRepository.save(bet);
    }

    @Transactional
    @EventListener
    public void finishBetDraw(ProofDrawEvent event) {
        if (event.contextType() != ContextType.BET) return;
        Bet bet = betRepository.findByProofId(event.proofId()).orElseThrow(() -> new IllegalArgumentException("Bet associated with proof ID " + event.proofId() + " not found."));
        if (bet.getStatus() != BetStatus.IN_JUDGMENT && bet.getStatus() != BetStatus.IN_PROGRESS) return;
        bet.setStatus(BetStatus.FINISHED_DRAW);
        bet.setClosedAt(Timestamp.from(Instant.now()));
        betRepository.save(bet);
        // TODO: return the coins to the players
    }
}
