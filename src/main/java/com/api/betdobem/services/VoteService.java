package com.api.betdobem.services;

import com.api.betdobem.domain.Vote;
import com.api.betdobem.dtos.requests.VoteRequest;
import com.api.betdobem.dtos.responses.VoteResponse;
import com.api.betdobem.repositories.VoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoteService {
    private VoteRepository voteRepository;

    public VoteService(VoteRepository voteRepository) {
        this.voteRepository = voteRepository;
    }

    public List<VoteResponse> getAllVotes() {
        return null;
    }

    public VoteResponse createVote(VoteRequest vote) {
        return null;
    }

    public VoteResponse getVoteById(Long id) {
        return null;
    }

    public VoteResponse updateVote(Long id, VoteRequest vote) {
        return null;
    }

    public void deleteVote(Long id) {
    }
}
