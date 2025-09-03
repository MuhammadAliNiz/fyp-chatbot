package com.ali.chatbotsb.exceptions;

public class ChatAccessDeniedException extends RuntimeException {
    public ChatAccessDeniedException(String message) {
        super(message);
    }

    public ChatAccessDeniedException(String message, Throwable cause) {
        super(message, cause);
    }
}
