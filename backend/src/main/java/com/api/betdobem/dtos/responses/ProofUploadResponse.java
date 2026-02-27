package com.api.betdobem.dtos.responses;

public record ProofUploadResponse(
        ProofResponse proofResponse,
        String uploadUrl
) {
}
