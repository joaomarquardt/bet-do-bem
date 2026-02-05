package com.api.betdobem.services;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.User;
import com.api.betdobem.domain.Vote;
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

    public VoteResponse createVote(Proof proof, User user, boolean isApproved) {
        Vote voteEntity = new Vote();
        voteEntity.setProof(proof);
        voteEntity.setVoter(user);
        voteEntity.setApproved(isApproved);
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
    
    public boolean hasUserAlreadyVotedInProof(Long proofId, Long voterId) {
        return voteRepository.existsByProofIdAndVoterId(proofId, voterId);
    }

    public long countApprovalsByProofId(Long proofId) {
        return voteRepository.countByProofIdAndApprovedTrue(proofId);
    }
}
