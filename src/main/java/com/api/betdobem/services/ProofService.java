package com.api.betdobem.services;

import com.api.betdobem.domain.Proof;
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

    public ProofService(ProofRepository proofRepository, ProofMapper proofMapper) {
        this.proofRepository = proofRepository;
        this.proofMapper = proofMapper;
    }

    public List<ProofResponse> getAllProofs() {
        List<Proof> proofs = proofRepository.findAll();
        return proofMapper.toProofResponseList(proofs);
    }

    public Proof getProofEntityById(Long id) {
        return proofRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Proof with ID " + id + " not found."));
    }

    public ProofResponse createProof(CreateProofRequest proof) {
        return null;
    }

    public ProofResponse getProofById(Long id) {
        return null;
    }

    public ProofResponse updateProof(Long id, UpdateProofRequest proof) {
        return null;
    }

    public void deleteProof(Long id) {
    }
}
