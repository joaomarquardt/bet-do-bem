package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record UserRequest(
        @NotBlank(message = "Name cannot be blank")
        String name,
        @NotBlank(message = "Email cannot be blank")
        @Email(message = "Email should be valid")
        String email,
        @Min(value = 0, message = "Coins must be greater than or equal to 0")
        Long coins
) {
}
