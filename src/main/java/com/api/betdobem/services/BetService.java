package com.api.betdobem.services;

import com.api.betdobem.domain.Bet;
import com.api.betdobem.dtos.requests.BetRequest;
import com.api.betdobem.dtos.responses.BetResponse;
import com.api.betdobem.repositories.BetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BetService {
    private BetRepository betRepository;

    public BetService(BetRepository betRepository) {
        this.betRepository = betRepository;
    }

    public List<BetResponse> getAllBets() {
        return null;
    }

    public BetResponse createBet(BetRequest bet) {
        return null;
    }

    public BetResponse getBetById(Long id) {
        return null;
    }

    public BetResponse updateBet(Long id, BetRequest bet) {
        return null;
    }

    public void deleteBet(Long id) {
    }
}
