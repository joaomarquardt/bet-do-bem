package com.api.betdobem.dtos.responses;

import com.api.betdobem.enums.ContextType;

import java.time.LocalDateTime;

public record FeedItemResponse(
        Long id,
        ContextType feedItemType,
        LocalDateTime createdAt,
        Object content
) {
}
