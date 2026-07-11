package com.api.betdobem.domain;

import com.api.betdobem.enums.GroupInviteStatus;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "group_invites")
public class GroupInvite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;
    @ManyToOne
    @JoinColumn(name = "inviter_id", nullable = false)
    private User inviter;
    @ManyToOne
    @JoinColumn(name = "invitee_id", nullable = false)
    private User invitee;
    @Enumerated(EnumType.STRING)
    private GroupInviteStatus status;
    private final Timestamp createdAt = Timestamp.from(Instant.now());
    private Timestamp respondedAt;
    private Timestamp expiresAt;

    public GroupInvite() {
    }

    public GroupInvite(Group group, User inviter, User invitee, Timestamp expiresAt) {
        this.group = group;
        this.inviter = inviter;
        this.invitee = invitee;
        this.status = GroupInviteStatus.PENDING;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
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

    public GroupInviteStatus getStatus() {
        return status;
    }

    public void setStatus(GroupInviteStatus status) {
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
