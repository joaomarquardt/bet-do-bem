package com.api.betdobem.dtos.requests;

import com.api.betdobem.enums.ActivityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateActivityRequest(
        @NotNull(message = "Author ID cannot be null")
        Long authorId,
        @NotNull(message = "Proof ID cannot be null")
        Long proofId,
        @NotBlank(message = "Description cannot be blank")
        String description,
        @NotNull(message = "Status cannot be null")
        ActivityStatus status
) {
}
