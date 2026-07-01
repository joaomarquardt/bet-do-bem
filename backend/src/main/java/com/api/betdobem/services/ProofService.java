package com.api.betdobem.services;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.CreateVoteRequest;
import com.api.betdobem.dtos.requests.UpdateProofRequest;
import com.api.betdobem.dtos.responses.ProofResponse;
import com.api.betdobem.dtos.responses.VotePercentageItemResponse;
import com.api.betdobem.dtos.responses.VotePercentageResponse;
import com.api.betdobem.dtos.responses.VotesByProof;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.events.ProofDecidedEvent;
import com.api.betdobem.events.ProofDrawEvent;
import com.api.betdobem.infra.exceptions.DuplicateActionException;
import com.api.betdobem.infra.exceptions.SelfInteractionException;
import com.api.betdobem.infra.exceptions.ForbiddenActionException;
import com.api.betdobem.mappers.ProofMapper;
import com.api.betdobem.repositories.ProofRepository;
import jakarta.persistence.EntityNotFoundException;
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
        return proofRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Proof with ID " + id + " not found."));
    }

    public Proof createProof(CreateProofRequest proof, Long userId) {
        User author = userService.getUserEntityById(userId);
        Proof proofEntity = proofMapper.toProofEntity(proof);
        proofEntity.setAuthor(author);
        Proof savedProof = proofRepository.save(proofEntity);
        return savedProof;
    }

    public VotePercentageResponse voteInProof(Long id, CreateVoteRequest vote, Long voterId) {
        Proof proof = getProofEntityById(id);
        if (!groupService.isUserMemberOfGroupLinkedToProof(voterId, id)) {
            throw new ForbiddenActionException("User must be a member of the group linked to the proof to vote.");
        }
        // TODO: Check if the proof is still open for voting
        if (proof.getAuthor().getId().equals(voterId)) {
            throw new SelfInteractionException("Author of the proof cannot vote on their own proof.");
        }
        // TODO: Opponent/Challenged should not be able to vote on the proof either, if applicable
        if (voteService.hasUserAlreadyVotedInProof(id, voterId)) {
            throw new DuplicateActionException("User has already voted in this proof.");
        }
        User voter = userService.getUserEntityById(voterId);
        ContextType contextType = proofRepository.findContextTypeByProofId(id);
        voteService.createVote(proof, voter, vote.approved());
        checkAndProcessConsensus(proof.getId(), contextType);
        long contextItemId = proofRepository.getContextItemIdByProofId(proof.getId());
        return getVotePercentage(proof.getId(), contextType, contextItemId);
    }

    public VotePercentageResponse getVotePercentage(Long proofId, ContextType contextType, Long contextItemId) {
        if (contextType == ContextType.ACTIVITY || contextType == ContextType.CHALLENGE) {
            return buildSingleProofResponse(proofId, contextType, contextItemId);
        } else if (contextType == ContextType.BET) {
            return buildBetResponse(proofId, contextType, contextItemId);
        }
        throw new IllegalStateException("Context type not supported for voting calculation: " + contextType);
    }

    private VotePercentageResponse buildSingleProofResponse(Long proofId, ContextType type, Long contextItemId) {
        long approvedVotes = voteService.countVotesByProofIdAndApprovedValue(proofId, true);
        long rejectedVotes = voteService.countVotesByProofIdAndApprovedValue(proofId, false);
        long totalVotes = approvedVotes + rejectedVotes;
        double approvalPercentage = safeCalculatePercentage(approvedVotes, totalVotes);
        double rejectionPercentage = safeCalculatePercentage(rejectedVotes, totalVotes);
        VotePercentageItemResponse votePercentageItem = new VotePercentageItemResponse(proofId, approvalPercentage, rejectionPercentage);
        return new VotePercentageResponse(totalVotes, type, contextItemId, List.of(votePercentageItem));
    }

    private VotePercentageResponse buildBetResponse(Long proofId, ContextType type, Long contextItemId) {
        Long otherProofId = proofRepository.getOtherProofIdByContextItemIdAndProofId(contextItemId, proofId);
        long approvedFirstProof = voteService.countVotesByProofIdAndApprovedValue(proofId, true);
        long approvedOtherProof = voteService.countVotesByProofIdAndApprovedValue(otherProofId, true);
        long totalVotes = approvedFirstProof + approvedOtherProof;
        double approvalFirstProof = safeCalculatePercentage(approvedFirstProof, totalVotes);
        double approvalOtherProof = safeCalculatePercentage(approvedOtherProof, totalVotes);
        double rejectionFirstProof = safeCalculatePercentage(totalVotes - approvedFirstProof, totalVotes);
        double rejectionOtherProof = safeCalculatePercentage(totalVotes - approvedOtherProof, totalVotes);
        VotePercentageItemResponse firstProofItem = new VotePercentageItemResponse(proofId, approvalFirstProof, rejectionFirstProof);
        VotePercentageItemResponse otherProofItem = new VotePercentageItemResponse(otherProofId, approvalOtherProof, rejectionOtherProof);
        return new VotePercentageResponse(totalVotes, type, contextItemId, List.of(firstProofItem, otherProofItem));
    }

    private double safeCalculatePercentage(long part, long total) {
        if (total == 0) return 0.0;
        return (double) part / total * 100;
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
        long majorityThreshold = contextType == ContextType.BET  || contextType == ContextType.CHALLENGE ? ((totalMembers - 2) / 2) + 1 : (totalMembers - 1) / 2 + 1;

        if (approvedVotes >= majorityThreshold) {
            eventPublisher.publishEvent(new ProofDecidedEvent(proofId, contextType, true));
        } else if (rejectedVotes >= majorityThreshold) {
            eventPublisher.publishEvent(new ProofDecidedEvent(proofId, contextType, false));
        }
        if (totalVotes >= totalMembers && approvedVotes == rejectedVotes) {
            eventPublisher.publishEvent(new ProofDrawEvent(proofId, contextType));
        }
    }

    public VotesByProof countVotesByProofId(Long proofId) {
        long approvedVotes = voteService.countVotesByProofIdAndApprovedValue(proofId, true);
        long rejectedVotes = voteService.countVotesByProofIdAndApprovedValue(proofId, false);
        return new VotesByProof(approvedVotes, rejectedVotes);
    }
}
