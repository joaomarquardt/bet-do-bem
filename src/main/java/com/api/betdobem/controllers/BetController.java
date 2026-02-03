package com.api.betdobem.controllers;

import com.api.betdobem.domain.Bet;
import com.api.betdobem.services.BetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bets")
public class BetController {
    private BetService betService;

    public BetController(BetService betService) {
        this.betService = betService;
    }

    @GetMapping
    public ResponseEntity<List<Bet>> getAllBets() {
        List<Bet> bets = betService.getAllBets();
        return new ResponseEntity<>(bets, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Bet> createBet(@RequestBody Bet bet) {
        Bet newBet = betService.createBet(bet);
        return new ResponseEntity<>(newBet, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bet> getBetById(@PathVariable Long id) {
        Bet bet = betService.getBetById(id);
        return new ResponseEntity<>(bet, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bet> updateBet(@PathVariable Long id, @RequestBody Bet bet) {
        Bet updatedBet = betService.updateBet(id, bet);
        return new ResponseEntity<>(updatedBet, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBet(@PathVariable Long id) {
        betService.deleteBet(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
