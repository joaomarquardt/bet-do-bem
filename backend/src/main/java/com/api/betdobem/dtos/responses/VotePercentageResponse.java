package com.api.betdobem.dtos.responses;

import com.api.betdobem.enums.ContextType;

import java.util.List;

public record VotePercentageResponse(
        Long totalVotes,
        ContextType contextType,
        Long contextItemId,
        List<VotePercentageItemResponse> votesByProof
) {
}
