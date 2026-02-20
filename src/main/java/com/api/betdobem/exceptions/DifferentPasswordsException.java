package com.api.betdobem.exceptions;

public class DifferentPasswordsException extends RuntimeException {
    public DifferentPasswordsException(String message) {
        super(message);
    }
}
