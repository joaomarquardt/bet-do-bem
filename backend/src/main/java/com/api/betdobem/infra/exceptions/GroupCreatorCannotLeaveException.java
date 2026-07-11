package com.api.betdobem.infra.exceptions;

public class GroupCreatorCannotLeaveException extends RuntimeException {
    public GroupCreatorCannotLeaveException(String message) {
        super(message);
    }
}
