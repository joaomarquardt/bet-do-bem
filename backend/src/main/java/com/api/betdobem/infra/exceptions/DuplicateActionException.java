package com.api.betdobem.infra.exceptions;

public class DuplicateActionException extends RuntimeException {
    public DuplicateActionException(String message) {
        super(message);
    }
}
