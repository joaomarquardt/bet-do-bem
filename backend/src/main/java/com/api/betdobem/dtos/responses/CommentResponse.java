package com.api.betdobem.dtos.responses;

import java.sql.Timestamp;

public record CommentResponse(
        Long id,
        String content,
        Long authorId,
        String authorName,
        Timestamp postedAt
) {
}
