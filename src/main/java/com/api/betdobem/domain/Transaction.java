package com.api.betdobem.domain;

import com.api.betdobem.enums.ContextType;
import com.api.betdobem.enums.TransactionType;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Long amount;
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;
    @Enumerated(EnumType.STRING)
    private ContextType contextType;
    private Long contextId;
    private final Timestamp createdAt = Timestamp.from(Instant.now());

    public Transaction() {
    }

    public Transaction(Long userId, Long amount, TransactionType transactionType, ContextType contextType, Long contextId) {
        this.userId = userId;
        this.amount = amount;
        this.transactionType = transactionType;
        this.contextType = contextType;
        this.contextId = contextId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public Long getContextId() {
        return contextId;
    }

    public void setContextId(Long contextId) {
        this.contextId = contextId;
    }

    public ContextType getContextType() {
        return contextType;
    }

    public void setContextType(ContextType contextType) {
        this.contextType = contextType;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }
}