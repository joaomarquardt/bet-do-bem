package com.api.betdobem.services;

import com.api.betdobem.domain.Vote;
import com.api.betdobem.dtos.requests.CreateVoteRequest;
import com.api.betdobem.dtos.requests.UpdateVoteRequest;
import com.api.betdobem.dtos.responses.VoteResponse;
import com.api.betdobem.mappers.VoteMapper;
import com.api.betdobem.repositories.VoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoteService {
    private VoteRepository voteRepository;
    private VoteMapper voteMapper;

    public VoteService(VoteRepository voteRepository, VoteMapper voteMapper) {
        this.voteRepository = voteRepository;
        this.voteMapper = voteMapper;
    }

    public List<VoteResponse> getAllVotes() {
        List<Vote> votes = voteRepository.findAll();
        return voteMapper.toVoteResponseList(votes);
    }

    public Vote getVoteEntityById(Long id) {
        return voteRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Vote with ID " + id + " not found."));
    }

    public VoteResponse createVote(CreateVoteRequest vote) {
        return null;
    }

    public VoteResponse getVoteById(Long id) {
        return null;
    }

    public VoteResponse updateVote(Long id, UpdateVoteRequest vote) {
        return null;
    }

    public void deleteVote(Long id) {
    }
}
