package com.api.betdobem.dtos.responses;

public record CreatedActivityResponse(
        ActivityResponse activity,
        String uploadUrl
) {
}
