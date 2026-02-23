package com.api.betdobem.dtos.responses;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.enums.ActivityStatus;

import java.sql.Timestamp;

public record ActivityResponse(
        Long id,
        UserResponse author,
        Proof proof,
        String description,
        ActivityStatus status,
        Long groupId,
        Timestamp createdAt,
        Timestamp closedAt,
        Timestamp expiresAt
) {
}
