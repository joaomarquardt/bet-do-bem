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
    @OneToOne
    @JoinColumn(name = "proof_id", nullable = false)
    private Proof proof;
    private Timestamp createdOn = Timestamp.from(Instant.now());
    private Timestamp deadline;
    @Enumerated(EnumType.STRING)
    private ChallengeStatus status;

    public Challenge() {
    }

    public Challenge(Long id, User challenger, User challenged, String description, Long penaltyValue, Proof proof, Timestamp createdOn, Timestamp deadline, ChallengeStatus status, String title) {
        this.id = id;
        this.challenger = challenger;
        this.challenged = challenged;
        this.description = description;
        this.penaltyValue = penaltyValue;
        this.proof = proof;
        this.createdOn = createdOn;
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

    public Timestamp getCreatedOn() {
        return createdOn;
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

    public void setCreatedOn(Timestamp createdOn) {
        this.createdOn = createdOn;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
