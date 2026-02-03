package com.api.betdobem.services;

import com.api.betdobem.domain.Bet;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateBetRequest;
import com.api.betdobem.dtos.requests.UpdateBetRequest;
import com.api.betdobem.dtos.responses.BetResponse;
import com.api.betdobem.enums.BetStatus;
import com.api.betdobem.mappers.BetMapper;
import com.api.betdobem.repositories.BetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BetService {
    private BetRepository betRepository;
    private BetMapper betMapper;
    private UserService userService;

    public BetService(BetRepository betRepository, BetMapper betMapper, UserService userService) {
        this.betRepository = betRepository;
        this.betMapper = betMapper;
        this.userService = userService;
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
        Bet betEntity = betMapper.toBetEntity(bet);
        betEntity.setStatus(BetStatus.OPEN);
        betEntity.setCreator(creator);
        betEntity.setOpponent(opponent);
        Bet savedBet = betRepository.save(betEntity);
        return betMapper.toBetResponse(savedBet);
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
}
