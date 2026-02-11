package com.api.betdobem.domain;

import com.api.betdobem.enums.BetStatus;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "bets")
public class Bet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
    @ManyToOne
    @JoinColumn(name = "opponent_id", nullable = false)
    private User opponent;
    @OneToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "bet_proofs",
            joinColumns = @JoinColumn(name = "bet_id"),
            inverseJoinColumns = @JoinColumn(name = "proof_id")
    )
    private List<Proof> proofs;
    private Long buyIn;
    private final Timestamp createdAt = Timestamp.from(Instant.now());
    private Timestamp closedAt;
    private Timestamp expiresAt;
    @Enumerated(EnumType.STRING)
    private BetStatus status;
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    public Bet() {
    }

    public Bet(Long id, User creator, User opponent, List<Proof> proofs, BetStatus status, String title, String description, Group group, Timestamp expiresAt) {
        this.id = id;
        this.creator = creator;
        this.opponent = opponent;
        this.proofs = proofs;
        this.status = status;
        this.title = title;
        this.description = description;
        this.group = group;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public User getOpponent() {
        return opponent;
    }

    public void setOpponent(User opponent) {
        this.opponent = opponent;
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

    public BetStatus getStatus() {
        return status;
    }

    public void setStatus(BetStatus status) {
        this.status = status;
    }

    public List<Proof> getProofs() {
        return proofs;
    }

    public void setProofs(List<Proof> proofs) {
        this.proofs = proofs;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public Long getBuyIn() {
        return buyIn;
    }

    public void setBuyIn(Long buyIn) {
        this.buyIn = buyIn;
    }

    public Timestamp getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Timestamp expiresAt) {
        this.expiresAt = expiresAt;
    }
}
