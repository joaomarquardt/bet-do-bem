package com.api.betdobem.services;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.Vote;
import com.api.betdobem.dtos.requests.CreateVoteRequest;
import com.api.betdobem.dtos.requests.UpdateVoteRequest;
import com.api.betdobem.dtos.responses.VoteResponse;
import com.api.betdobem.mappers.VoteMapper;
import com.api.betdobem.repositories.VoteRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class VoteService {
    private VoteRepository voteRepository;
    private VoteMapper voteMapper;
    private ProofService proofService;

    public VoteService(VoteRepository voteRepository, VoteMapper voteMapper, ProofService proofService) {
        this.voteRepository = voteRepository;
        this.voteMapper = voteMapper;
        this.proofService = proofService;
    }

    public List<VoteResponse> getAllVotes() {
        List<Vote> votes = voteRepository.findAll();
        return voteMapper.toVoteResponseList(votes);
    }

    public Vote getVoteEntityById(Long id) {
        return voteRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Vote with ID " + id + " not found."));
    }

    public VoteResponse createVote(CreateVoteRequest vote) {
        Proof proof = proofService.getProofEntityById(vote.proofId());
        if (vote.voterId().equals(proof.getAuthor().getId())) {
            throw new IllegalArgumentException("Author of the proof cannot vote on their own proof.");
        }
        Vote voteEntity = voteMapper.toVoteEntity(vote);
        Vote savedVote = voteRepository.save(voteEntity);
        return voteMapper.toVoteResponse(savedVote);
    }

    public VoteResponse getVoteById(Long id) {
        Vote vote = getVoteEntityById(id);
        return voteMapper.toVoteResponse(vote);
    }

    // Analyze if updateVote is necessary in the application context
    public VoteResponse updateVote(Long id, UpdateVoteRequest vote) {
        return null;
    }

    public void deleteVote(Long id) {
        voteRepository.deleteById(id);
    }
}
