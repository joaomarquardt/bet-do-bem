package com.api.betdobem.dtos.responses;

public record UserProfileResponse(
        Long id,
        String name,
        String email,
        String profilePictureUrl,
        Long coins,
        Long winningBets,
        Long registeredActivities,
        Long computedVotes
) {
}
