package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateActivityRequest(
        @NotNull(message = "Author ID cannot be null")
        Long authorId, // TODO: Remover authorId daqui
        CreateProofRequest proof,
        @NotBlank(message = "Description cannot be blank")
        String description,
        @NotNull(message = "Group ID cannot be null")
        Long groupId
) {
}
