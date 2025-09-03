package com.ali.chatbotsb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    private UUID sessionId;
    private String sessionTitle;
    private String userMessage;
    private String botResponse;
    private Double confidenceScore;
    private List<String> sourceReferences;
    private LocalDateTime timestamp;
    private boolean isNewSession;
}
