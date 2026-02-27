package com.api.betdobem.dtos.responses;

import java.sql.Timestamp;

public record ProofResponse(
        Long id,
        String imageUrl,
        String contentType,
        Long authorId,
        Timestamp postedAt
) {
}
