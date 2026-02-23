package com.api.betdobem.dtos.responses;

import java.sql.Timestamp;

public record ProofResponse(
        Long id,
        String imageUrl,
        String description,
        Long authorId,
        Timestamp postedAt
) {
}
