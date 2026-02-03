package com.api.betdobem.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "proofs")
public class Proof {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String imageUrl;
    private String description;
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    public Proof() {
    }

    public Proof(Long id, String imageUrl, String description, User author) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.description = description;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }
}
