package com.api.betdobem.dtos.responses;

import com.api.betdobem.enums.BetStatus;

import java.sql.Timestamp;
import java.util.List;

public record BetResponse(
        Long id,
        String title,
        String description,
        UserResponse creator,
        UserResponse opponent,
        List<ProofResponse> proofs,
        Long buyIn,
        BetStatus status,
        Long groupId,
        Timestamp createdAt,
        Timestamp closedAt,
        Timestamp expiresAt
) {
}
