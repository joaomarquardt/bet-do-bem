package com.api.betdobem.dtos.responses;

public record UserResponse(
        Long id,
        String name,
        String email,
        String profilePictureUrl,
        Long coins
) {
}
