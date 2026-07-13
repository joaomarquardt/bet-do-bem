package com.api.betdobem.infra.exceptions;

public class ProofAlreadySentException extends RuntimeException {
    public ProofAlreadySentException(String message) {
        super(message);
    }
}
