package com.api.betdobem.domain;

import com.api.betdobem.enums.ActivityStatus;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "activities")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    @OneToOne
    @JoinColumn(name = "proof_id", nullable = false)
    private Proof proof;
    private String description;
    @Enumerated(EnumType.STRING)
    private ActivityStatus status;
    private Timestamp createdAt;

    public Activity() {
    }

    public Activity(Long id, User author, Proof proof, String description, ActivityStatus status) {
        this.id = id;
        this.author = author;
        this.proof = proof;
        this.description = description;
        this.status = status;
        this.createdAt = Timestamp.from(Instant.now());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public Proof getProof() {
        return proof;
    }

    public void setProof(Proof proof) {
        this.proof = proof;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ActivityStatus getStatus() {
        return status;
    }

    public void setStatus(ActivityStatus status) {
        this.status = status;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
