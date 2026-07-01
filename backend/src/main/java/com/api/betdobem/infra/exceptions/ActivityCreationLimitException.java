package com.api.betdobem.infra.exceptions;

public class ActivityCreationLimitException extends RuntimeException {
    public ActivityCreationLimitException(String message) {
        super(message);
    }
}
