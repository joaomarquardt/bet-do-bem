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
    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
    @ManyToOne
    @JoinColumn(name = "opponent_id", nullable = false)
    private User opponent;
    @OneToMany
    @JoinColumn(name = "proof_id", nullable = false)
    private List<Proof> proofs;
    private final Timestamp createdOn = Timestamp.from(Instant.now());
    private Timestamp closedOn;
    @Enumerated(EnumType.STRING)
    private BetStatus status;

    public Bet() {
    }

    public Bet(Long id, User creator, User opponent, List<Proof> proofs, Timestamp closedOn, BetStatus status) {
        this.id = id;
        this.creator = creator;
        this.opponent = opponent;
        this.proofs = proofs;
        this.closedOn = closedOn;
        this.status = status;
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

    public Timestamp getCreatedOn() {
        return createdOn;
    }

    public Timestamp getClosedOn() {
        return closedOn;
    }

    public void setClosedOn(Timestamp closedOn) {
        this.closedOn = closedOn;
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
}
