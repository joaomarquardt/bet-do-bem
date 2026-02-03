package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotNull;

public record CreateVoteRequest(
        @NotNull(message = "Voter ID cannot be null")
        Long voterId,
        @NotNull(message = "Proof ID cannot be null")
        Long proofId,
        @NotNull(message = "Approved status cannot be null")
        Boolean approved
) {
}
