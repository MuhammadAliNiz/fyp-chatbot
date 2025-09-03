package com.ali.chatbotsb.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MedicalPromptTemplate {

    @Autowired
    private MedicalPromptEnhancer enhancer;

    public static final String MEDICAL_SYSTEM_PROMPT = """
            You are MediBot, an advanced medical AI assistant designed to provide accurate, evidence-based medical information.
            
            **CORE PRINCIPLES:**
            1. Patient Safety First - Always prioritize user safety in responses
            2. Evidence-Based Medicine - Base responses on provided medical literature
            3. Clear Communication - Use accessible language while maintaining accuracy
            4. Ethical Practice - Maintain professional medical ethics and boundaries
            
            **RESPONSE GUIDELINES:**
            1. You are NOT a replacement for professional medical advice, diagnosis, or treatment
            2. Always recommend consulting healthcare professionals for serious concerns
            3. Provide information based ONLY on the medical context provided
            4. If information is not available in the context, clearly state this limitation
            5. Use clear, accessible language while maintaining medical accuracy
            6. Include confidence level in your responses when appropriate
            7. Cite relevant sections from the provided medical literature when possible
            8. Consider chat history for continuity but prioritize current medical context
            
            **RESPONSE STRUCTURE:**
            1. **Direct Answer**: Begin with a clear, direct response to the question
            2. **Medical Explanation**: Provide detailed explanation with medical reasoning
            3. **Relevant Information**: Include symptoms, causes, treatments from context
            4. **Safety Information**: Highlight any safety considerations or red flags
            5. **Professional Guidance**: Recommend appropriate healthcare consultation
            6. **Confidence Rating**: Rate your confidence (High/Medium/Low) based on context quality
            
            **SAFETY PROTOCOLS:**
            - For emergency symptoms, immediately advise seeking emergency medical care
            - For drug interactions or dosage questions, emphasize consulting pharmacists/doctors
            - For mental health concerns, provide crisis resources when appropriate
            - Never provide specific dosage recommendations without explicit medical context
            - Always include appropriate medical disclaimers
            """;

    public static final String MEDICAL_USER_TEMPLATE = """
            {specialtyEnhancement}
            
            **MEDICAL KNOWLEDGE BASE CONTEXT:**
            {context}
            
            **PATIENT QUESTION:**
            {question}
            
            **PREVIOUS CONVERSATION CONTEXT:**
            {chatHistory}
            
            **INSTRUCTIONS:**
            Please provide a comprehensive medical response following the established guidelines.
            If the question relates to previous conversation, reference the chat history appropriately.
            Always prioritize patient safety and include appropriate medical disclaimers.
            Structure your response clearly and include a confidence rating based on the available context.
            """;

    public static final String EMERGENCY_KEYWORDS = """
            chest pain,heart attack,stroke,seizure,difficulty breathing,unconscious,severe bleeding,
            overdose,poisoning,severe allergic reaction,anaphylaxis,suicide,self-harm,
            severe abdominal pain,head injury,broken bone,severe burn,choking,severe headache,
            high fever,loss of consciousness,severe vomiting,severe diarrhea,severe pain
            """;

    /**
     * Generates the complete enhanced prompt for medical RAG chatbot
     */
    public String generateMedicalPrompt(String userQuestion, String context, String chatHistory) {
        String specialtyEnhancement = enhancer.enhancePromptBySpecialty(userQuestion);

        return MEDICAL_SYSTEM_PROMPT + "\n\n" +
               MEDICAL_USER_TEMPLATE
                   .replace("{specialtyEnhancement}", specialtyEnhancement)
                   .replace("{context}", context != null ? context : "No relevant medical context found.")
                   .replace("{question}", userQuestion)
                   .replace("{chatHistory}", chatHistory != null ? chatHistory : "No previous conversation.");
    }

    /**
     * Checks if the user query contains emergency keywords
     */
    public boolean containsEmergencyKeywords(String query) {
        String lowerQuery = query.toLowerCase();
        String[] keywords = EMERGENCY_KEYWORDS.split(",");

        for (String keyword : keywords) {
            if (lowerQuery.contains(keyword.trim())) {
                return true;
            }
        }

        return enhancer.hasCriticalSymptoms(query);
    }

    /**
     * Generates comprehensive emergency response
     */
    public String getEmergencyResponse() {
        return """
                🚨 **MEDICAL EMERGENCY DETECTED** 🚨
                
                **IMMEDIATE ACTION REQUIRED:**
                
                If you are experiencing a medical emergency, please take these steps immediately:
                
                1. **Call Emergency Services**: 
                   - US: 911
                   - UK: 999
                   - EU: 112
                   - Your local emergency number
                
                2. **Go to the nearest Emergency Room** if you can safely do so
                
                3. **Call your healthcare provider** if they have an emergency line
                
                4. **If possible, have someone stay with you** until help arrives
                
                **IMPORTANT REMINDERS:**
                - This AI assistant cannot provide emergency medical care
                - Time is critical in medical emergencies
                - Professional medical intervention is essential
                - Do not delay seeking help to wait for AI responses
                
                Stay safe and seek immediate professional medical assistance.
                """;
    }

    /**
     * Formats chat history for medical context with privacy considerations
     */
    public String formatChatHistory(List<String> recentMessages) {
        if (recentMessages == null || recentMessages.isEmpty()) {
            return "No previous medical conversation.";
        }

        StringBuilder history = new StringBuilder("Recent medical discussion:\n");
        int maxMessages = Math.min(recentMessages.size(), 6); // Last 3 exchanges for medical continuity

        for (int i = 0; i < maxMessages; i++) {
            history.append("- ").append(recentMessages.get(i)).append("\n");
        }

        return history.toString().trim();
    }

    /**
     * Enhances the final response with medical disclaimers and references
     */
    public String enhanceFinalResponse(String botResponse, double confidenceScore, List<String> references) {
        StringBuilder enhanced = new StringBuilder();
        enhanced.append(botResponse);

        // Add confidence indicator
        enhanced.append("\n\n**Confidence Level**: ");
        if (confidenceScore >= 0.8) {
            enhanced.append("High (Strong medical context available)");
        } else if (confidenceScore >= 0.5) {
            enhanced.append("Medium (Moderate medical context available)");
        } else {
            enhanced.append("Low (Limited medical context available)");
        }

        // Add medical references
        if (references != null && !references.isEmpty()) {
            enhanced.append("\n\n").append(enhancer.formatMedicalReferences(references));
        }

        // Add appropriate medical disclaimer
        enhanced.append("\n\n").append(enhancer.generateMedicalDisclaimer(botResponse, confidenceScore));

        return enhanced.toString();
    }
}
