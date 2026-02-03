package com.api.betdobem.services;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.dtos.requests.ProofRequest;
import com.api.betdobem.dtos.responses.ProofResponse;
import com.api.betdobem.repositories.ProofRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProofService {
    private ProofRepository proofRepository;

    public ProofService(ProofRepository proofRepository) {
        this.proofRepository = proofRepository;
    }

    public List<ProofResponse> getAllProofs() {
        return null;
    }

    public ProofResponse createProof(ProofRequest proof) {
        return null;
    }

    public ProofResponse getProofById(Long id) {
        return null;
    }

    public ProofResponse updateProof(Long id, ProofRequest proof) {
        return null;
    }

    public void deleteProof(Long id) {
    }
}
