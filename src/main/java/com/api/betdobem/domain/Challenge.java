package com.api.betdobem.domain;

import com.api.betdobem.enums.ChallengeStatus;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "challenges")
public class Challenge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "challenger_id", nullable = false)
    private User challenger;
    @ManyToOne
    @JoinColumn(name = "challenged_id", nullable = false)
    private User challenged;
    private String title;
    private String description;
    private Long penaltyValue;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinTable(
            name = "challenge_proofs",
            joinColumns = @JoinColumn(name = "challenge_id"),
            inverseJoinColumns = @JoinColumn(name = "proof_id")
    )
    private Proof proof;
    private final Timestamp createdAt = Timestamp.from(Instant.now());
    private Timestamp deadline;
    @Enumerated(EnumType.STRING)
    private ChallengeStatus status;

    public Challenge() {
    }

    public Challenge(Long id, User challenger, User challenged, String description, Long penaltyValue, Proof proof, Timestamp deadline, ChallengeStatus status, String title) {
        this.id = id;
        this.challenger = challenger;
        this.challenged = challenged;
        this.description = description;
        this.penaltyValue = penaltyValue;
        this.proof = proof;
        this.deadline = deadline;
        this.status = status;
        this.title = title;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getChallenger() {
        return challenger;
    }

    public void setChallenger(User challenger) {
        this.challenger = challenger;
    }

    public User getChallenged() {
        return challenged;
    }

    public void setChallenged(User challenged) {
        this.challenged = challenged;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getPenaltyValue() {
        return penaltyValue;
    }

    public void setPenaltyValue(Long penaltyValue) {
        this.penaltyValue = penaltyValue;
    }

    public Timestamp getDeadline() {
        return deadline;
    }

    public void setDeadline(Timestamp deadline) {
        this.deadline = deadline;
    }

    public ChallengeStatus getStatus() {
        return status;
    }

    public void setStatus(ChallengeStatus status) {
        this.status = status;
    }

    public Proof getProof() {
        return proof;
    }

    public void setProof(Proof proof) {
        this.proof = proof;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
