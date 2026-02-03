package com.api.betdobem.controllers;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.dtos.requests.ProofRequest;
import com.api.betdobem.dtos.responses.ProofResponse;
import com.api.betdobem.services.ProofService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/proofs")
public class ProofController {
    private ProofService proofService;

    public ProofController(ProofService proofService) {
        this.proofService = proofService;
    }

    @GetMapping
    public ResponseEntity<List<ProofResponse>> getAllProofs() {
        List<ProofResponse> proofs = proofService.getAllProofs();
        return new ResponseEntity<>(proofs, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ProofResponse> createProof(@RequestBody @Valid ProofRequest proof) {
        ProofResponse newProof = proofService.createProof(proof);
        return new ResponseEntity<>(newProof, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProofResponse> getProofById(@PathVariable Long id) {
        ProofResponse proof = proofService.getProofById(id);
        return new ResponseEntity<>(proof, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProofResponse> updateProof(@PathVariable Long id, @RequestBody @Valid ProofRequest proof) {
        ProofResponse updatedProof = proofService.updateProof(id, proof);
        return new ResponseEntity<>(updatedProof, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProof(@PathVariable Long id) {
        proofService.deleteProof(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
