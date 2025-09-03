package com.ali.chatbotsb.exceptions;

public class MedicalProcessingException extends RuntimeException {
    public MedicalProcessingException(String message) {
        super(message);
    }

    public MedicalProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
