package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record CreateGroupRequest(
        @NotBlank(message = "Name cannot be blank")
        String name,
        @NotBlank(message = "Description cannot be blank")
        String description,
        @NotNull(message = "Creator ID cannot be null")
        Long creatorId,
        Set<Long> memberIds
) {
}
