package com.api.betdobem.services;

import com.api.betdobem.domain.Bet;
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

    public BetService(BetRepository betRepository, BetMapper betMapper) {
        this.betRepository = betRepository;
        this.betMapper = betMapper;
    }

    public List<BetResponse> getAllBets() {
        List<Bet> bets = betRepository.findAll();
        return betMapper.toBetResponseList(bets);
    }

    public BetResponse createBet(CreateBetRequest bet) {
        if (bet.creatorId().equals(bet.opponentId())) {
            throw new IllegalArgumentException("Creator and opponent cannot be the same user.");
        }
        Bet betEntity = betMapper.toBetEntity(bet);
        betEntity.setStatus(BetStatus.OPEN);
        Bet savedBet = betRepository.save(betEntity);
        return betMapper.toBetResponse(savedBet);
    }

    public Bet getBetEntityById(Long id) {
        return betRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Bet with ID " + id + " not found."));
    }

    public BetResponse getBetById(Long id) {
        return null;
    }

    public BetResponse updateBet(Long id, UpdateBetRequest bet) {
        return null;
    }

    public void deleteBet(Long id) {
    }
}
