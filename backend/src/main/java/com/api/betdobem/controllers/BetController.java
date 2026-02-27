package com.api.betdobem.controllers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateBetRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateBetRequest;
import com.api.betdobem.dtos.responses.BetResponse;
import com.api.betdobem.dtos.responses.ProofUploadResponse;
import com.api.betdobem.services.BetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bets")
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
    public ResponseEntity<BetResponse> createBet(@RequestBody @Valid CreateBetRequest bet) {
        BetResponse newBet = betService.createBet(bet);
        return new ResponseEntity<>(newBet, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/proofs")
    public ResponseEntity<ProofUploadResponse> addProofToBet(@PathVariable Long id, @RequestBody @Valid CreateProofRequest proof, @AuthenticationPrincipal User loggedUser) {
        ProofUploadResponse proofUpload = betService.addProofToBet(id, proof, loggedUser.getId());
        return new ResponseEntity<>(proofUpload, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<BetResponse> acceptBet(@PathVariable Long id, @AuthenticationPrincipal User user) {
        BetResponse bet = betService.acceptBet(id, user.getId());
        return new ResponseEntity<>(bet, HttpStatus.OK);
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<BetResponse> declineBet(@PathVariable Long id, @AuthenticationPrincipal User user) {
        BetResponse bet = betService.declineBet(id, user.getId());
        return new ResponseEntity<>(bet, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BetResponse> getBetById(@PathVariable Long id) {
        BetResponse bet = betService.getBetById(id);
        return new ResponseEntity<>(bet, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BetResponse> updateBet(@PathVariable Long id, @RequestBody @Valid UpdateBetRequest bet) {
        BetResponse updatedBet = betService.updateBet(id, bet);
        return new ResponseEntity<>(updatedBet, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBet(@PathVariable Long id) {
        betService.deleteBet(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
