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
    @OneToOne(cascade = CascadeType.ALL)
    @JoinTable(
            name = "activity_proofs",
            joinColumns = @JoinColumn(name = "activity_id"),
            inverseJoinColumns = @JoinColumn(name = "proof_id")
    )
    private Proof proof;
    private String description;
    @Enumerated(EnumType.STRING)
    private ActivityStatus status;
    private final Timestamp createdAt = Timestamp.from(Instant.now());
    private Timestamp closedAt;
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    public Activity() {
    }

    public Activity(Long id, User author, Proof proof, String description, ActivityStatus status, Group group) {
        this.id = id;
        this.author = author;
        this.proof = proof;
        this.description = description;
        this.status = status;
        this.group = group;
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

    public Timestamp getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(Timestamp closedAt) {
        this.closedAt = closedAt;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }
}
