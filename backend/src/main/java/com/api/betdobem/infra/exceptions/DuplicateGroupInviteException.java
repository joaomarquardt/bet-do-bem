package com.api.betdobem.infra.exceptions;

public class DuplicateGroupInviteException extends RuntimeException {
    public DuplicateGroupInviteException(String message) {
        super(message);
    }
}
