package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateBetRequest(
        @NotBlank(message = "Title cannot be blank")
        String title,
        @NotBlank(message = "Description cannot be blank")
        String description,
        @NotNull(message = "Creator ID cannot be null")
        Long creatorId,
        @NotNull(message = "Opponent ID cannot be null")
        Long opponentId
) {
}
