package com.api.betdobem.dtos.responses;

import com.api.betdobem.enums.ActivityStatus;

public record ActivityResponse(
        Long id,
        Long authorId,
        Long proofId,
        String description,
        ActivityStatus status
) {
}
