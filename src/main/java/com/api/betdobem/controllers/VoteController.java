package com.api.betdobem.controllers;

import com.api.betdobem.dtos.requests.UpdateVoteRequest;
import com.api.betdobem.dtos.responses.VoteResponse;
import com.api.betdobem.services.VoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/votes")
public class VoteController {
    private VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @GetMapping
    public ResponseEntity<List<VoteResponse>> getAllVotes() {
        List<VoteResponse> votes = voteService.getAllVotes();
        return new ResponseEntity<>(votes, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoteResponse> getVoteById(@PathVariable Long id) {
        VoteResponse vote = voteService.getVoteById(id);
        return new ResponseEntity<>(vote, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VoteResponse> updateVote(@PathVariable Long id, @RequestBody @Valid UpdateVoteRequest vote) {
        VoteResponse updatedVote = voteService.updateVote(id, vote);
        return new ResponseEntity<>(updatedVote, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVote(@PathVariable Long id) {
        voteService.deleteVote(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
