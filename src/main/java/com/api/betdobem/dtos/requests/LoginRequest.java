package com.api.betdobem.dtos.requests;

public record LoginRequest(
        String email,
        String password
) {
}
