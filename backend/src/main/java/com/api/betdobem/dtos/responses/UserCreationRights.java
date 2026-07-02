package com.api.betdobem.dtos.responses;

public record UserCreationRights(
        boolean hasBoughtChallenge,
        boolean canCreateActivity
) {
}
