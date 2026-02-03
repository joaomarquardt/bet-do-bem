package com.api.betdobem.controllers;

import com.api.betdobem.domain.Bet;
import com.api.betdobem.dtos.requests.BetRequest;
import com.api.betdobem.dtos.responses.BetResponse;
import com.api.betdobem.services.BetService;
import jakarta.validation.Valid;
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
    public ResponseEntity<List<BetResponse>> getAllBets() {
        List<BetResponse> bets = betService.getAllBets();
        return new ResponseEntity<>(bets, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<BetResponse> createBet(@RequestBody @Valid BetRequest bet) {
        BetResponse newBet = betService.createBet(bet);
        return new ResponseEntity<>(newBet, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BetResponse> getBetById(@PathVariable Long id) {
        BetResponse bet = betService.getBetById(id);
        return new ResponseEntity<>(bet, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BetResponse> updateBet(@PathVariable Long id, @RequestBody @Valid BetRequest bet) {
        BetResponse updatedBet = betService.updateBet(id, bet);
        return new ResponseEntity<>(updatedBet, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBet(@PathVariable Long id) {
        betService.deleteBet(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
