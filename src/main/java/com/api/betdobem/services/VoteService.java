package com.api.betdobem.services;

import com.api.betdobem.domain.Vote;
import com.api.betdobem.repositories.VoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoteService {
    private VoteRepository voteRepository;

    public VoteService(VoteRepository voteRepository) {
        this.voteRepository = voteRepository;
    }

    public List<Vote> getAllVotes() {
        return null;
    }

    public Vote createVote(Vote vote) {
        return null;
    }

    public Vote getVoteById(Long id) {
        return null;
    }

    public Vote updateVote(Long id, Vote vote) {
        return null;
    }

    public void deleteVote(Long id) {
    }
}
