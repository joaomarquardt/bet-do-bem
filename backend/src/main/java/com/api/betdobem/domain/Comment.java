package com.api.betdobem.domain;

import com.api.betdobem.enums.ContextType;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private ContextType contextType;
    private Long contextId;
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    private String content;
    private final Timestamp postedAt = Timestamp.from(Instant.now());

    public Comment() {
    }

    public Comment(Long id, ContextType contextType, Long contextId, User author, String content) {
        this.id = id;
        this.contextType = contextType;
        this.contextId = contextId;
        this.author = author;
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ContextType getContextType() {
        return contextType;
    }

    public void setContextType(ContextType contextType) {
        this.contextType = contextType;
    }

    public Long getContextId() {
        return contextId;
    }

    public void setContextId(Long contextId) {
        this.contextId = contextId;
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
