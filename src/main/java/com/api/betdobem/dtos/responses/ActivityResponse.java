package com.api.betdobem.dtos.responses;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.enums.ActivityStatus;

public record ActivityResponse(
        Long id,
        Long authorId,
        Proof proof,
        String description,
        ActivityStatus status
) {
}
