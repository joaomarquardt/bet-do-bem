package com.api.betdobem.dtos.responses;

public record FriendResponse(
        Long id,
        String fullName,
        String username,
        String profilePictureUrl
) {
}
