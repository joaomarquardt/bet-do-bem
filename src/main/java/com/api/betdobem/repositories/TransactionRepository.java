package com.api.betdobem.repositories;

import com.api.betdobem.domain.Transaction;
import com.api.betdobem.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    boolean existsByTransactionTypeAndContextIdAndUserId(TransactionType transactionType, Long contextId, Long userId);
}
