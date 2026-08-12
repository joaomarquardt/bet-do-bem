package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotBlank;

public record CreateFriendInviteRequest(
        @NotBlank(message = "Username cannot be blank")
        String username
) {
}
