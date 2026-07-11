package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record CreateGroupInviteRequest(
        @NotEmpty(message = "Invitee IDs cannot be empty")
        Set<Long> inviteeIds
) {
}
