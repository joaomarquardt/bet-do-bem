package com.api.betdobem.services;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.repositories.ProofRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProofService {
    private ProofRepository proofRepository;

    public ProofService(ProofRepository proofRepository) {
        this.proofRepository = proofRepository;
    }

    public List<Proof> getAllProofs() {
        return null;
    }

    public Proof createProof(Proof proof) {
        return null;
    }

    public Proof getProofById(Long id) {
        return null;
    }

    public Proof updateProof(Long id, Proof proof) {
        return null;
    }

    public void deleteProof(Long id) {
    }
}
