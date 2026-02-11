package com.api.betdobem.services;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.CreateVoteRequest;
import com.api.betdobem.dtos.requests.UpdateProofRequest;
import com.api.betdobem.dtos.responses.ProofResponse;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.events.ProofDecidedEvent;
import com.api.betdobem.events.ProofDrawEvent;
import com.api.betdobem.mappers.ProofMapper;
import com.api.betdobem.repositories.ProofRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProofService {
    private ProofRepository proofRepository;
    private ProofMapper proofMapper;
    private UserService userService;
    private VoteService voteService;
    private GroupService groupService;
    private ApplicationEventPublisher eventPublisher;

    public ProofService(ProofRepository proofRepository, ProofMapper proofMapper, UserService userService, VoteService voteService, GroupService groupService, ApplicationEventPublisher eventPublisher) {
        this.proofRepository = proofRepository;
        this.proofMapper = proofMapper;
        this.userService = userService;
        this.voteService = voteService;
        this.groupService = groupService;
        this.eventPublisher = eventPublisher;
    }

    public List<ProofResponse> getAllProofs() {
        List<Proof> proofs = proofRepository.findAll();
        return proofMapper.toProofResponseList(proofs);
    }

    public Proof getProofEntityById(Long id) {
        return proofRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Proof with ID " + id + " not found."));
    }

    public Proof createProof(CreateProofRequest proof) {
        User author = userService.getUserEntityById(proof.authorId());
        Proof proofEntity = proofMapper.toProofEntity(proof);
        proofEntity.setAuthor(author);
        Proof savedProof = proofRepository.save(proofEntity);
        return savedProof;
    }

    public void voteInProof(Long id, CreateVoteRequest vote) {
        Proof proof = getProofEntityById(id);
        if (!groupService.isUserMemberOfGroupLinkedToProof(vote.voterId(), id)) {
            throw new IllegalArgumentException("User must be a member of the group linked to the proof to vote.");
        }
        // TODO: Check if the proof is still open for voting
        if (proof.getAuthor().getId().equals(vote.voterId())) {
            throw new IllegalArgumentException("Author of the proof cannot vote on their own proof.");
        }
        // TODO: Opponent/Challenged should not be able to vote on the proof either, if applicable
        if (voteService.hasUserAlreadyVotedInProof(id, vote.voterId())) {
            throw new IllegalArgumentException("User has already voted in this proof.");
        }
        User voter = userService.getUserEntityById(vote.voterId());
        ContextType contextType = proofRepository.findContextTypeByProofId(id);
        voteService.createVote(proof, voter, vote.approved());
        checkAndProcessConsensus(proof.getId(), contextType);
    }

    public ProofResponse getProofById(Long id) {
        Proof proof = getProofEntityById(id);
        return proofMapper.toProofResponse(proof);
    }

    // Analyze if updateProof is necessary in the application context
    public ProofResponse updateProof(Long id, UpdateProofRequest proof) {
        return null;
    }

    public void deleteProof(Long id) {
        proofRepository.deleteById(id);
    }

    public void checkAndProcessConsensus(Long proofId, ContextType contextType) {
        Long groupId = groupService.findGroupIdByProofId(proofId);
        long approvedVotes = voteService.countVotesByProofIdAndApprovedValue(proofId, true);
        long rejectedVotes = voteService.countVotesByProofIdAndApprovedValue(proofId, false);
        long totalMembers = groupService.countMembersByGroupId(groupId);
        long totalVotes = approvedVotes + rejectedVotes;
        long majorityThreshold = (totalMembers / 2) + 1;

        if (approvedVotes >= majorityThreshold) {
            eventPublisher.publishEvent(new ProofDecidedEvent(proofId, contextType, true));
        } else if (rejectedVotes >= majorityThreshold) {
            eventPublisher.publishEvent(new ProofDecidedEvent(proofId, contextType, false));
        }
        if (totalVotes >= totalMembers && approvedVotes == rejectedVotes) {
            eventPublisher.publishEvent(new ProofDrawEvent(proofId, contextType));
        }
    }
}
