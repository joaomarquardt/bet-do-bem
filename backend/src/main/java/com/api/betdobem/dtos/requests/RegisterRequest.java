package com.api.betdobem.dtos.requests;

public record RegisterRequest(
        String fullName,
        String username,
        String email,
        String password,
        String passwordConfirmation
) {
}
