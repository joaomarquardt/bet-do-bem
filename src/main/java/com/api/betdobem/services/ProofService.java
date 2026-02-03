package com.api.betdobem.services;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateProofRequest;
import com.api.betdobem.dtos.responses.ProofResponse;
import com.api.betdobem.mappers.ProofMapper;
import com.api.betdobem.repositories.ProofRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProofService {
    private ProofRepository proofRepository;
    private ProofMapper proofMapper;
    private UserService userService;

    public ProofService(ProofRepository proofRepository, ProofMapper proofMapper, UserService userService) {
        this.proofRepository = proofRepository;
        this.proofMapper = proofMapper;
        this.userService = userService;
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
}
