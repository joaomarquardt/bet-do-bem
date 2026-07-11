package com.api.betdobem.dtos.responses;

import java.sql.Timestamp;

public record GroupInviteResponse(
        Long id,
        Long groupId,
        String groupName,
        String groupDescription,
        UserResponse inviter,
        UserResponse invitee,
        String status,
        Timestamp createdAt,
        Timestamp expiresAt,
        Timestamp respondedAt
) {
}
