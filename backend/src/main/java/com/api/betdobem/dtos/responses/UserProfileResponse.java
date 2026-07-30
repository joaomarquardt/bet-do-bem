package com.api.betdobem.dtos.responses;

public record UserProfileResponse(
        Long id,
        String fullName,
        String username,
        String email,
        String profilePictureUrl,
        Long coins,
        Long friendsCount,
        Long winningBets,
        Long registeredActivities,
        Long computedVotes
) {
}
