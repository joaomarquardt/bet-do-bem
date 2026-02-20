package com.api.betdobem.exceptions;

public class DuplicateActionException extends RuntimeException {
    public DuplicateActionException(String message) {
        super(message);
    }
}
