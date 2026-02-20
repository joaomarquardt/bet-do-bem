package com.api.betdobem.infra.exceptions;

public class SelfInteractionException extends RuntimeException {
    public SelfInteractionException(String message) {
        super(message);
    }
}
