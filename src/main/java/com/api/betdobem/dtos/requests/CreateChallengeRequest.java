package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.sql.Timestamp;

public record CreateChallengeRequest(
        @NotNull(message = "Challenger ID cannot be null")
        Long challengerId,
        @NotNull(message = "Challenged ID cannot be null")
        Long challengedId,
        @NotBlank(message = "Title cannot be blank")
        String title,
        @NotBlank(message = "Description cannot be blank")
        String description,
        @NotNull(message = "Penalty value cannot be null")
        @Min(value = 0, message = "Penalty value must be greater than or equal to 0")
        Long penaltyValue,
        @Future(message = "Deadline must be a future date and time")
        Timestamp deadline,
        @NotNull(message = "Group ID cannot be null")
        Long groupId
) {
}
