package com.api.betdobem.dtos.responses;

import com.api.betdobem.enums.ChallengeStatus;

import java.sql.Timestamp;

public record ChallengeResponse(
        Long id,
        Long challengerId,
        Long challengedId,
        String title,
        String description,
        Long penaltyValue,
        ProofResponse proof,
        Timestamp createdAt,
        Timestamp deadline,
        ChallengeStatus status
) {
}
