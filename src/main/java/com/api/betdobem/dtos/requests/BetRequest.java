package com.api.betdobem.dtos.requests;

import com.api.betdobem.enums.BetStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.sql.Timestamp;

public record BetRequest(
        @NotBlank(message = "Title cannot be blank")
        String title,
        @NotBlank(message = "Description cannot be blank")
        String description,
        @NotNull(message = "Creator ID cannot be null")
        Long creatorId,
        @NotNull(message = "Opponent ID cannot be null")
        Long opponentId,
        Timestamp closedOn,
        @NotNull(message = "Status cannot be null")
        BetStatus status
) {
}
