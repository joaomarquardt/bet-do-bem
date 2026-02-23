package com.api.betdobem.infra.handler;

import com.api.betdobem.infra.exceptions.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RestErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        RestErrorResponse response = new RestErrorResponse(status.value(), errors);
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler({
            SelfInteractionException.class,
            InsufficientFundsException.class,
            InvalidOperationException.class,
            DifferentPasswordsException.class,
            InvalidStatusException.class
    })
    public ResponseEntity<RestErrorResponse> handleBadRequestExceptions(RuntimeException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        RestErrorResponse errorResponse = new RestErrorResponse(status.value(), ex.getMessage());
        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler({
            DuplicateActionException.class,
            EmailAlreadyExistsException.class
    })
    public ResponseEntity<RestErrorResponse> handleConflictExceptions(RuntimeException ex) {
        HttpStatus status = HttpStatus.CONFLICT;
        RestErrorResponse errorResponse = new RestErrorResponse(status.value(), ex.getMessage());
        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler({
            UnauthorizedActionException.class,
            AuthenticationFailedException.class
    })
    public ResponseEntity<RestErrorResponse> handleSecurityExceptions(RuntimeException ex) {
        HttpStatus status;
        if (ex instanceof AuthenticationFailedException) {
            status = HttpStatus.UNAUTHORIZED;
        } else {
            status = HttpStatus.FORBIDDEN;
        }
        RestErrorResponse errorResponse = new RestErrorResponse(status.value(), ex.getMessage());
        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<RestErrorResponse> handleGeneralExceptions(Exception ex) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        RestErrorResponse errorResponse = new RestErrorResponse(status.value(), "An unexpected error occurred");
        return ResponseEntity.status(status).body(errorResponse);
    }
}
