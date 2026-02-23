package com.api.betdobem.dtos.responses;

public record VotesByProof(
        long approvedVotes,
        long rejectedVotes
) {
}
