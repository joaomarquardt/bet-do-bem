package com.api.betdobem.controllers;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.services.ProofService;
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
    public ResponseEntity<List<Proof>> getAllProofs() {
        List<Proof> proofs = proofService.getAllProofs();
        return new ResponseEntity<>(proofs, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Proof> createProof(@RequestBody Proof proof) {
        Proof newProof = proofService.createProof(proof);
        return new ResponseEntity<>(newProof, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proof> getProofById(@PathVariable Long id) {
        Proof proof = proofService.getProofById(id);
        return new ResponseEntity<>(proof, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proof> updateProof(@PathVariable Long id, @RequestBody Proof proof) {
        Proof updatedProof = proofService.updateProof(id, proof);
        return new ResponseEntity<>(updatedProof, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProof(@PathVariable Long id) {
        proofService.deleteProof(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
