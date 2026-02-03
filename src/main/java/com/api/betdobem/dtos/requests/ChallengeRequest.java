package com.api.betdobem.dtos.requests;

import com.api.betdobem.enums.ChallengeStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.sql.Timestamp;

public record ChallengeRequest(
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
        @NotNull(message = "Proof ID cannot be null")
        Long proofId,
        Timestamp deadline,
        @NotNull(message = "Status cannot be null")
        ChallengeStatus status
) {
}
