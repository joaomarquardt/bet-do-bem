package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.sql.Timestamp;

public record CreateBetRequest(
        @NotBlank(message = "Title cannot be blank")
        String title,
        @NotBlank(message = "Description cannot be blank")
        String description,
        @NotNull(message = "Buy-in amount cannot be null")
        @Min(value = 1, message = "Buy-in amount must be greater than zero")
        Long buyIn,
        @Future(message = "Invite expiration must be a future date and time")
        Timestamp inviteExpiresAt,
        @Future(message = "Deadline must be a future date and time")
        Timestamp deadline,
        @NotNull(message = "Opponent ID cannot be null")
        Long opponentId,
        @NotNull(message = "Group ID cannot be null")
        Long groupId
) {
}
