package com.api.betdobem.domain;

import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "proof_comments")
public class ProofComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "proof_id", nullable = false)
    private Proof proof;
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    private String content;
    private final Timestamp postedAt = Timestamp.from(Instant.now());

    public ProofComment() {
    }

    public ProofComment(Long id, Proof proof, User author, String content) {
        this.id = id;
        this.proof = proof;
        this.author = author;
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Proof getProof() {
        return proof;
    }

    public void setProof(Proof proof) {
        this.proof = proof;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Timestamp getPostedAt() {
        return postedAt;
    }
}
