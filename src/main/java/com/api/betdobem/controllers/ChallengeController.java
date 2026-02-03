package com.api.betdobem.controllers;

import com.api.betdobem.domain.Challenge;
import com.api.betdobem.dtos.requests.ChallengeRequest;
import com.api.betdobem.dtos.responses.ChallengeResponse;
import com.api.betdobem.services.ChallengeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/challenges")
public class ChallengeController {
    private ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> getAllChallenges() {
        List<ChallengeResponse> challenges = challengeService.getAllChallenges();
        return new ResponseEntity<>(challenges, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ChallengeResponse> createChallenge(@RequestBody @Valid ChallengeRequest challenge) {
        ChallengeResponse newChallenge = challengeService.createChallenge(challenge);
        return new ResponseEntity<>(newChallenge, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeResponse> getChallengeById(@PathVariable Long id) {
        ChallengeResponse challenge = challengeService.getChallengeById(id);
        return new ResponseEntity<>(challenge, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChallengeResponse> updateChallenge(@PathVariable Long id, @RequestBody @Valid ChallengeRequest challenge) {
        ChallengeResponse updatedChallenge = challengeService.updateChallenge(id, challenge);
        return new ResponseEntity<>(updatedChallenge, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChallenge(@PathVariable Long id) {
        challengeService.deleteChallenge(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
