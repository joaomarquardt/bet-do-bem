package com.api.betdobem.dtos.responses;

import java.sql.Timestamp;
import java.util.List;

public record GroupResponse(
        Long id,
        String name,
        String description,
        Long creatorId,
        Timestamp createdAt,
        List<Long> memberIds
) {
}
