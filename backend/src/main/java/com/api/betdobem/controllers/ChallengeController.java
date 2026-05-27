package com.api.betdobem.controllers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateChallengeRequest;
import com.api.betdobem.dtos.requests.CreateCommentRequest;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateChallengeRequest;
import com.api.betdobem.dtos.responses.ChallengeResponse;
import com.api.betdobem.dtos.responses.CommentResponse;
import com.api.betdobem.dtos.responses.ProofUploadResponse;
import com.api.betdobem.services.ChallengeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
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
    public ResponseEntity<ChallengeResponse> createChallenge(@RequestBody @Valid CreateChallengeRequest challenge, @AuthenticationPrincipal User loggedUser) {
        ChallengeResponse newChallenge = challengeService.createChallenge(challenge, loggedUser.getId());
        return new ResponseEntity<>(newChallenge, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/proofs")
    public ResponseEntity<ProofUploadResponse> addProofToChallenge(@PathVariable Long id, @RequestBody @Valid CreateProofRequest proof, @AuthenticationPrincipal User loggedUser) {
        ProofUploadResponse proofUpload = challengeService.addProofToChallenge(id, proof, loggedUser.getId());
        return new ResponseEntity<>(proofUpload, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ChallengeResponse> acceptChallenge(@PathVariable Long id, @AuthenticationPrincipal User user) {
        ChallengeResponse challenge = challengeService.acceptChallenge(id, user.getId());
        return new ResponseEntity<>(challenge, HttpStatus.OK);
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<ChallengeResponse> declineChallenge(@PathVariable Long id, @AuthenticationPrincipal User user) {
        ChallengeResponse challenge = challengeService.declineChallenge(id, user.getId());
        return new ResponseEntity<>(challenge, HttpStatus.OK);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long id, @RequestBody @Valid CreateCommentRequest comment, @AuthenticationPrincipal User loggedUser) {
        CommentResponse commentResponse = challengeService.addComment(id, comment, loggedUser);
        return new ResponseEntity<>(commentResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeResponse> getChallengeById(@PathVariable Long id) {
        ChallengeResponse challenge = challengeService.getChallengeById(id);
        return new ResponseEntity<>(challenge, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChallengeResponse> updateChallenge(@PathVariable Long id, @RequestBody @Valid UpdateChallengeRequest challenge) {
        ChallengeResponse updatedChallenge = challengeService.updateChallenge(id, challenge);
        return new ResponseEntity<>(updatedChallenge, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChallenge(@PathVariable Long id) {
        challengeService.deleteChallenge(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
