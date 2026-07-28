package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotNull;

public record CreateFriendInviteRequest(
        @NotNull(message = "Invitee ID cannot be null")
        Long inviteeId
) {
}
