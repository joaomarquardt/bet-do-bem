package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotBlank;

public record UpdateActivityRequest(
        @NotBlank(message = "Description cannot be blank")
        String description
) {
}
