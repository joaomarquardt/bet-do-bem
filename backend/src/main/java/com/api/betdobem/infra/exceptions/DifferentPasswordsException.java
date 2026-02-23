package com.api.betdobem.infra.exceptions;

public class DifferentPasswordsException extends RuntimeException {
    public DifferentPasswordsException(String message) {
        super(message);
    }
}
