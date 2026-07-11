package com.api.betdobem.infra.exceptions;

public class ActiveItemsInGroupException extends RuntimeException {
    public ActiveItemsInGroupException(String message) {
        super(message);
    }
}
