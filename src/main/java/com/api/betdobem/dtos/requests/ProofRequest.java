package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProofRequest(
        @NotBlank(message = "Image URL cannot be blank")
        String imageUrl,
        @NotBlank(message = "Description cannot be blank")
        String description,
        @NotNull(message = "Author ID cannot be null")
        Long authorId
) {
}
