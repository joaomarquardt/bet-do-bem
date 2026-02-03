package com.api.betdobem.services;

import com.api.betdobem.domain.Bet;
import com.api.betdobem.repositories.BetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BetService {
    private BetRepository betRepository;

    public BetService(BetRepository betRepository) {
        this.betRepository = betRepository;
    }

    public List<Bet> getAllBets() {
        return null;
    }

    public Bet createBet(Bet bet) {
        return null;
    }

    public Bet getBetById(Long id) {
        return null;
    }

    public Bet updateBet(Long id, Bet bet) {
        return null;
    }

    public void deleteBet(Long id) {
    }
}
