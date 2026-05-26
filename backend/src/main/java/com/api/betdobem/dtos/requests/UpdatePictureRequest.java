package com.api.betdobem.dtos.requests;

import jakarta.validation.constraints.NotBlank;

public record UpdatePictureRequest(
        @NotBlank(message = "Image URL cannot be blank")
        String fileName,
        @NotBlank(message = "Content type cannot be blank")
        String contentType,
        String imageUrl
) {
}
