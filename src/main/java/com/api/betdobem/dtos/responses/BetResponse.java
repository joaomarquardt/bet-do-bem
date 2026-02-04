package com.api.betdobem.dtos.responses;

import com.api.betdobem.enums.BetStatus;

import java.sql.Timestamp;
import java.util.List;

public record BetResponse(
        Long id,
        String title,
        String description,
        Long creatorId,
        Long opponentId,
        List<ProofResponse> proofs,
        Timestamp createdAt,
        Timestamp closedAt,
        BetStatus status
) {
}
