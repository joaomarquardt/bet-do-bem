package com.api.betdobem.dtos.responses;

import com.api.betdobem.enums.ChallengeStatus;

import java.sql.Timestamp;

public record ChallengeResponse(
        Long id,
        UserResponse challenger,
        UserResponse challenged,
        String title,
        String description,
        Long amount,
        ChallengeStatus status,
        Long groupId,
        ProofResponse proof,
        Timestamp createdAt,
        Timestamp deadline
) {
}
