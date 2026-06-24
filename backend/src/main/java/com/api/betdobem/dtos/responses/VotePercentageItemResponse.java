package com.api.betdobem.dtos.responses;

public record VotePercentageItemResponse(
        Long proofId,
        Double approvedPercentage,
        Double disapprovedPercentage
) {
}
