package com.api.betdobem.domain;

import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "proofs")
public class Proof {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileName;
    private String contentType;
    private String imageUrl;
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    @OneToMany(mappedBy = "proof", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProofComment> comments;
    @Column(name = "posted_at")
    private final Timestamp postedAt = Timestamp.from(Instant.now());

    public Proof() {
    }

    public Proof(Long id, String imageUrl, String fileName, String contentType, User author) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.fileName = fileName;
        this.contentType = contentType;
        this.author = author;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public List<ProofComment> getComments() {
        return comments;
    }

    public void setComments(List<ProofComment> comments) {
        this.comments = comments;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public Timestamp getPostedAt() {
        return postedAt;
    }
}
