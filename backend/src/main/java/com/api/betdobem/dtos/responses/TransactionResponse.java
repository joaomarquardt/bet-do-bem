package com.api.betdobem.dtos.responses;

import com.api.betdobem.enums.ContextType;
import com.api.betdobem.enums.TransactionType;

import java.sql.Timestamp;

public record TransactionResponse(
        Long id,
        Long amount,
        Long contextId,
        ContextType contextType,
        TransactionType transactionType,
        Timestamp createdAt
) {
}
