package com.api.betdobem.dtos.responses;

public record UserResponse(
        Long id,
        String fullName,
        String username,
        String email,
        String profilePictureUrl,
        Long coins
) {
}
