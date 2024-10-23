package com.example.real_time_chat_app.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.Map;
import java.util.HashMap;

/** Handles all exceptions globally. */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation exceptions.
     * 
     * @param ex the exception
     * @return a bad request containing a map of the errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @SendToUser("/queue/errors")
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        for (ObjectError error : ex.getBindingResult().getAllErrors()) {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        }

        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Handles all other exceptions besides validation.
     * 
     * @param ex the exception
     * @return an internal server error with a map of the errors
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalExceptions(Exception ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", ex.getMessage());

        return ResponseEntity.internalServerError().body(errors);
    }

}
