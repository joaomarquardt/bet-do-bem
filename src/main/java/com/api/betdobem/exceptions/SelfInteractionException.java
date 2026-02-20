package com.api.betdobem.exceptions;

public class SelfInteractionException extends RuntimeException {
    public SelfInteractionException(String message) {
        super(message);
    }
}
