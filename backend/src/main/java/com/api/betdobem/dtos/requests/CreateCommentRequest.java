package com.api.betdobem.dtos.requests;

public record CreateCommentRequest(
        String content,
        Long authorId
) {
}
