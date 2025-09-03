package com.ali.chatbotsb.exceptions;

public class VectorStoreException extends RuntimeException {
    public VectorStoreException(String message) {
        super(message);
    }

    public VectorStoreException(String message, Throwable cause) {
        super(message, cause);
    }
}
