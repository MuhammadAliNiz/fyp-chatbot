package com.ali.chatbotsb.service;

import com.ali.chatbotsb.dto.ChatMessageDto;
import com.ali.chatbotsb.dto.ChatRequest;
import com.ali.chatbotsb.dto.ChatResponse;
import com.ali.chatbotsb.dto.ChatSessionDto;
import com.ali.chatbotsb.exceptions.ChatSessionNotFoundException;
import com.ali.chatbotsb.exceptions.ChatAccessDeniedException;
import com.ali.chatbotsb.exceptions.MedicalProcessingException;
import com.ali.chatbotsb.exceptions.VectorStoreException;
import com.ali.chatbotsb.model.ChatSession;
import com.ali.chatbotsb.model.ChatMessage;
import com.ali.chatbotsb.model.User;
import com.ali.chatbotsb.repository.ChatSessionRepository;
import com.ali.chatbotsb.repository.ChatMessageRepository;
import com.ali.chatbotsb.repository.UserRepository;
import com.ali.chatbotsb.utils.MedicalPromptTemplate;
import lombok.RequiredArgsConstructor;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.document.Document;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final MedicalPromptTemplate promptTemplate;

    @Transactional
    public ChatResponse processChat(ChatRequest request) {
        try {
            User currentUser = getCurrentUser();

            // Check for emergency keywords
            if (promptTemplate.containsEmergencyKeywords(request.getMessage())) {
                return ChatResponse.builder()
                        .userMessage(request.getMessage())
                        .botResponse(promptTemplate.getEmergencyResponse())
                        .confidenceScore(1.0)
                        .timestamp(LocalDateTime.now())
                        .build();
            }

            // Get or create chat session
            ChatSession session = getOrCreateChatSession(request, currentUser);

            // Simple fallback response if AI services are not available
            String botResponse;
            Double confidenceScore = 0.7;
            List<String> sourceReferences = List.of();

            try {
                // Get chat history for context
                String chatHistory = getChatHistory(session);

                // Perform similarity search
                List<Document> relevantDocs = performSimilaritySearch(request.getMessage());
                String context = extractContext(relevantDocs);

                // Generate response using medical prompt template
                botResponse = generateMedicalResponse(request.getMessage(), context, chatHistory);
                confidenceScore = calculateConfidenceScore(relevantDocs);
                sourceReferences = extractSourceReferences(relevantDocs);
                
            } catch (Exception e) {
                botResponse = generateFallbackResponse(request.getMessage());
                confidenceScore = 0.5;
            }

            // Save chat message
            ChatMessage chatMessage = saveChatMessage(session, request.getMessage(), botResponse, "", confidenceScore);

            // Update session timestamp
            session.setUpdatedAt(LocalDateTime.now());
            chatSessionRepository.save(session);

            return ChatResponse.builder()
                    .sessionId(session.getId())
                    .sessionTitle(session.getTitle())
                    .userMessage(request.getMessage())
                    .botResponse(botResponse)
                    .confidenceScore(confidenceScore)
                    .sourceReferences(sourceReferences)
                    .timestamp(chatMessage.getCreatedAt())
                    .isNewSession(request.getSessionId() == null)
                    .build();
        } catch (Exception e) {
            throw new MedicalProcessingException("Unable to process medical request. Please try again or consult a healthcare professional.", e);
        }
    }

    @Transactional(readOnly = true)
    public List<ChatSessionDto> getUserChatSessions() {
        User currentUser = getCurrentUser();
        List<ChatSession> sessions = chatSessionRepository.findByUserOrderByUpdatedAtDesc(currentUser);

        return sessions.stream()
                .map(this::convertToSessionDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChatSessionDto getChatSessionWithMessages(UUID sessionId) {
        User currentUser = getCurrentUser();
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ChatSessionNotFoundException("Chat session not found with ID: " + sessionId));

        // Security check
        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new ChatAccessDeniedException("Access denied to chat session: " + sessionId);
        }

        List<ChatMessage> messages = chatMessageRepository.findByChatSessionOrderByCreatedAtAsc(session);

        return ChatSessionDto.builder()
                .id(session.getId())
                .title(session.getTitle())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .messageCount(messages.size())
                .messages(messages.stream()
                        .map(this::convertToMessageDto)
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public void deleteChatSession(UUID sessionId) {
        User currentUser = getCurrentUser();
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ChatSessionNotFoundException("Chat session not found with ID: " + sessionId));

        // Security check
        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new ChatAccessDeniedException("Access denied to delete chat session: " + sessionId);
        }

        chatSessionRepository.delete(session);
    }

    private ChatSession getOrCreateChatSession(ChatRequest request, User user) {
        if (request.getSessionId() != null) {
            ChatSession session = chatSessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new ChatSessionNotFoundException("Chat session not found with ID: " + request.getSessionId()));

            // Security check
            if (!session.getUser().getId().equals(user.getId())) {
                throw new ChatAccessDeniedException("Access denied to chat session: " + request.getSessionId());
            }
            return session;
        }

        // Create new session
        String title = request.getSessionTitle() != null ?
                request.getSessionTitle() :
                generateSessionTitle(request.getMessage());

        return chatSessionRepository.save(
                ChatSession.builder()
                        .user(user)
                        .title(title)
                        .build()
        );
    }

    private String getChatHistory(ChatSession session) {
        List<ChatMessage> recentMessages = chatMessageRepository
                .findByChatSessionOrderByCreatedAtAsc(session)
                .stream()
                .skip(Math.max(0, session.getMessages().size() - 6)) // Last 3 exchanges
                .collect(Collectors.toList());

        List<String> formattedHistory = recentMessages.stream()
                .map(msg -> "User: " + msg.getUserMessage() + "\nBot: " + msg.getBotResponse())
                .collect(Collectors.toList());

        return promptTemplate.formatChatHistory(formattedHistory);
    }

    private List<Document> performSimilaritySearch(String query) {
        try {
            SearchRequest searchRequest = SearchRequest.builder()
                    .query(query)
                    .topK(5) // Increased for better medical context
                    .similarityThreshold(0.7) // Higher threshold for medical accuracy
                    .build();

            return vectorStore.similaritySearch(searchRequest);
        } catch (Exception e) {
            throw new VectorStoreException("Failed to search medical knowledge base", e);
        }
    }

    private String extractContext(List<Document> documents) {
        if (documents.isEmpty()) {
            return "No relevant medical information found in the knowledge base.";
        }

        return documents.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));
    }

    private String generateMedicalResponse(String question, String context, String chatHistory) {
        try {
            String prompt = promptTemplate.generateMedicalPrompt(question, context, chatHistory);

            String rawResponse = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            // Get confidence score for response enhancement
            List<Document> relevantDocs = performSimilaritySearch(question);
            Double confidenceScore = calculateConfidenceScore(relevantDocs);
            List<String> references = extractSourceReferences(relevantDocs);

            // Enhance the response with medical disclaimers and references
            return promptTemplate.enhanceFinalResponse(rawResponse, confidenceScore, references);

        } catch (Exception e) {
            throw new MedicalProcessingException("Failed to generate medical response", e);
        }
    }

    private Double calculateConfidenceScore(List<Document> documents) {
        if (documents.isEmpty()) {
            return 0.1; // Very low confidence with no context
        }

        // Calculate average similarity score
        double avgScore = documents.stream()
                .mapToDouble(doc -> {
                    // Assuming similarity score is available in metadata
                    Object score = doc.getMetadata().get("similarity_score");
                    return score instanceof Number ? ((Number) score).doubleValue() : 0.5;
                })
                .average()
                .orElse(0.5);

        return Math.min(1.0, Math.max(0.0, avgScore));
    }

    private List<String> extractSourceReferences(List<Document> documents) {
        return documents.stream()
                .map(doc -> {
                    Object source = doc.getMetadata().get("source");
                    return source != null ? source.toString() : "Medical Knowledge Base";
                })
                .distinct()
                .collect(Collectors.toList());
    }

    private ChatMessage saveChatMessage(ChatSession session, String userMessage,
                                      String botResponse, String context, Double confidenceScore) {
        ChatMessage message = ChatMessage.builder()
                .chatSession(session)
                .userMessage(userMessage)
                .botResponse(botResponse)
                .contextUsed(context)
                .confidenceScore(confidenceScore)
                .build();

        return chatMessageRepository.save(message);
    }

    private String generateSessionTitle(String firstMessage) {
        // Generate a concise title from the first message
        String title = firstMessage.length() > 50 ?
                firstMessage.substring(0, 47) + "..." :
                firstMessage;
        return title.replaceAll("[^a-zA-Z0-9\\s]", "").trim();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ChatSessionDto convertToSessionDto(ChatSession session) {
        List<ChatMessage> messages = chatMessageRepository.findByChatSessionOrderByCreatedAtAsc(session);

        return ChatSessionDto.builder()
                .id(session.getId())
                .title(session.getTitle())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .messageCount(messages.size())
                .lastMessage(messages.isEmpty() ? "No messages" :
                           messages.get(messages.size() - 1).getUserMessage())
                .build();
    }

    private ChatMessageDto convertToMessageDto(ChatMessage message) {
        return ChatMessageDto.builder()
                .id(message.getId())
                .userMessage(message.getUserMessage())
                .botResponse(message.getBotResponse())
                .confidenceScore(message.getConfidenceScore())
                .createdAt(message.getCreatedAt())
                .build();
    }

    // Legacy method for backward compatibility
    public String askQuestion(String query) {
        ChatRequest request = ChatRequest.builder()
                .message(query)
                .build();

        ChatResponse response = processChat(request);
        return response.getBotResponse();
    }

    private String generateFallbackResponse(String userMessage) {
        // Simple keyword-based responses for testing
        String message = userMessage.toLowerCase();
        
        if (message.contains("hello") || message.contains("hi")) {
            return "Hello! I'm your medical AI assistant. I'm currently running in basic mode. How can I help you with your health questions today?\n\n" +
                   "⚠️ **Medical Disclaimer**: This is for informational purposes only. Please consult with healthcare professionals for medical advice.";
        }
        
        if (message.contains("pain") || message.contains("hurt")) {
            return "I understand you're experiencing pain. While I can provide general information, it's important to consult with a healthcare professional for proper evaluation and treatment.\n\n" +
                   "**General advice for pain management:**\n" +
                   "- Rest the affected area\n" +
                   "- Apply ice for acute injuries\n" +
                   "- Consider over-the-counter pain relievers as directed\n" +
                   "- Seek medical attention if pain is severe or persistent\n\n" +
                   "⚠️ **Please consult a healthcare provider for proper diagnosis and treatment.**";
        }
        
        if (message.contains("fever") || message.contains("temperature")) {
            return "Fever can be a sign of various conditions. Here's some general information:\n\n" +
                   "**When to seek medical attention:**\n" +
                   "- Temperature above 103°F (39.4°C)\n" +
                   "- Fever lasting more than 3 days\n" +
                   "- Severe symptoms like difficulty breathing\n" +
                   "- Signs of dehydration\n\n" +
                   "**General care:**\n" +
                   "- Stay hydrated\n" +
                   "- Rest\n" +
                   "- Monitor temperature regularly\n\n" +
                   "⚠️ **Always consult healthcare professionals for persistent or high fevers.**";
        }
        
        // Generic response for other medical questions
        return "Thank you for your medical question. I'm currently operating in basic mode due to technical limitations.\n\n" +
               "For reliable medical information, I recommend:\n" +
               "- Consulting with your healthcare provider\n" +
               "- Visiting reputable medical websites like Mayo Clinic or WebMD\n" +
               "- Calling your doctor's office for advice\n" +
               "- Seeking emergency care if symptoms are severe\n\n" +
               "⚠️ **Medical Disclaimer**: This response is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment.";
    }

    /**
     * Create a new chat session explicitly
     */
    @Transactional
    public ChatSessionDto createNewChatSession(String title) {
        User currentUser = getCurrentUser();
        
        String sessionTitle = title != null && !title.trim().isEmpty() 
                ? title.trim() 
                : "New Chat Session";
        
        ChatSession newSession = ChatSession.builder()
                .user(currentUser)
                .title(sessionTitle)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        ChatSession savedSession = chatSessionRepository.save(newSession);
        return convertToSessionDto(savedSession);
    }
}
