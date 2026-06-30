package com.api.betdobem.dtos.responses;

public record LoginResult(
        String accessToken,
        String refreshToken
) {
}
