package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotNull;

public record CreateVoteRequest(
        @NotNull(message = "Approved status cannot be null")
        Boolean approved
) {
}
