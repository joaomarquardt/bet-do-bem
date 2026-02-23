package com.api.betdobem.dtos.responses;

import java.sql.Timestamp;

public record VoteResponse(
        Long id,
        Long voterId,
        Long proofId,
        boolean approved,
        Timestamp votedAt
) {
}
