package com.api.betdobem.infra.exceptions;

public class InviteNotPendingException extends RuntimeException {
    public InviteNotPendingException(String message) {
        super(message);
    }
}
