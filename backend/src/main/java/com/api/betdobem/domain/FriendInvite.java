package com.api.betdobem.domain;

import com.api.betdobem.enums.FriendInviteStatus;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "friend_invites")
public class FriendInvite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "inviter_id", nullable = false)
    private User inviter;
    @ManyToOne
    @JoinColumn(name = "invitee_id", nullable = false)
    private User invitee;
    @Enumerated(EnumType.STRING)
    private FriendInviteStatus status;
    private final Timestamp createdAt = Timestamp.from(Instant.now());
    private Timestamp respondedAt;
    private Timestamp expiresAt;

    public FriendInvite() {
    }

    public FriendInvite(User inviter, User invitee, Timestamp expiresAt) {
        this.inviter = inviter;
        this.invitee = invitee;
        this.status = FriendInviteStatus.PENDING;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getInviter() {
        return inviter;
    }

    public void setInviter(User inviter) {
        this.inviter = inviter;
    }

    public User getInvitee() {
        return invitee;
    }

    public void setInvitee(User invitee) {
        this.invitee = invitee;
    }

    public FriendInviteStatus getStatus() {
        return status;
    }

    public void setStatus(FriendInviteStatus status) {
        this.status = status;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public Timestamp getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(Timestamp respondedAt) {
        this.respondedAt = respondedAt;
    }

    public Timestamp getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Timestamp expiresAt) {
        this.expiresAt = expiresAt;
    }
}
