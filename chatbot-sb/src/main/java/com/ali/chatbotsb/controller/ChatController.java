package com.ali.chatbotsb.controller;

import com.ali.chatbotsb.dto.ApiResponse;
import com.ali.chatbotsb.dto.ChatRequest;
import com.ali.chatbotsb.dto.ChatResponse;
import com.ali.chatbotsb.dto.ChatSessionDto;
import com.ali.chatbotsb.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('USER')")
public class ChatController {

    private final ChatService chatService;

    /**
     * Main chat endpoint for medical RAG chatbot
     */
    @PostMapping("/message")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(@Valid @RequestBody ChatRequest request) {
        log.info("Processing chat message for user");
        ChatResponse response = chatService.processChat(request);
        return ResponseEntity.ok(ApiResponse.success("Message processed successfully", response));
    }

    /**
     * Get all chat sessions for the current user
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ChatSessionDto>>> getChatSessions() {
        List<ChatSessionDto> sessions = chatService.getUserChatSessions();
        return ResponseEntity.ok(ApiResponse.success("Chat sessions retrieved successfully", sessions));
    }

    /**
     * Get a specific chat session with all messages
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<ChatSessionDto>> getChatSession(@PathVariable UUID sessionId) {
        ChatSessionDto session = chatService.getChatSessionWithMessages(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Chat session retrieved successfully", session));
    }

    /**
     * Delete a chat session
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> deleteChatSession(@PathVariable UUID sessionId) {
        chatService.deleteChatSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Chat session deleted successfully"));
    }

    /**
     * Start a new chat session
     */
    @PostMapping("/sessions/new")
    public ResponseEntity<ApiResponse<ChatResponse>> startNewSession(@Valid @RequestBody ChatRequest request) {
        // Ensure sessionId is null to create new session
        request.setSessionId(null);
        ChatResponse response = chatService.processChat(request);
        return ResponseEntity.ok(ApiResponse.success("New chat session created successfully", response));
    }

    /**
     * Create a new empty chat session
     */
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSessionDto>> createChatSession(@RequestBody Map<String, String> requestBody) {
        String title = requestBody.get("title");
        ChatSessionDto session = chatService.createNewChatSession(title);
        return ResponseEntity.ok(ApiResponse.success("Chat session created successfully", session));
    }

    /**
     * Legacy endpoint for backward compatibility
     */
    @GetMapping("/ask")
    @Deprecated
    public ResponseEntity<ApiResponse<String>> ask(@RequestParam String query) {
        log.warn("Using deprecated /ask endpoint. Please migrate to /message endpoint.");
        String response = chatService.askQuestion(query);
        return ResponseEntity.ok(ApiResponse.success("Question answered successfully (deprecated endpoint)", response));
    }

    /**
     * Health check endpoint for chat service
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Medical RAG Chatbot is operational", "Service is healthy"));
    }
}