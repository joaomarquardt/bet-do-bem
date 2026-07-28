package com.api.betdobem.dtos.responses;

import java.sql.Timestamp;

public record FriendInviteResponse(
        Long id,
        UserResponse inviter,
        UserResponse invitee,
        String status,
        Timestamp createdAt,
        Timestamp expiresAt,
        Timestamp respondedAt
) {
}
