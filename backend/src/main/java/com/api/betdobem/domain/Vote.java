package com.api.betdobem.domain;

import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"voter_id", "proof_id"})
})
public class Vote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "voter_id", nullable = false)
    private User voter;
    @ManyToOne
    @JoinColumn(name = "proof_id", nullable = false)
    private Proof proof;
    private boolean approved;
    private final Timestamp votedAt = Timestamp.from(Instant.now());

    public Vote() {
    }

    public Vote(Long id, User voter, Proof proof, boolean approved) {
        this.id = id;
        this.voter = voter;
        this.proof = proof;
        this.approved = approved;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getVoter() {
        return voter;
    }

    public void setVoter(User voter) {
        this.voter = voter;
    }

    public Proof getProof() {
        return proof;
    }

    public void setProof(Proof proof) {
        this.proof = proof;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public Timestamp getVotedAt() {
        return votedAt;
    }
}
