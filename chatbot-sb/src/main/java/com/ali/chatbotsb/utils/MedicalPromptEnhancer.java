package com.ali.chatbotsb.utils;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Component
public class MedicalPromptEnhancer {

    private static final Map<String, String> MEDICAL_SPECIALTIES = new HashMap<>() {{
        put("cardiology", "cardiovascular system, heart conditions, blood pressure, cardiac procedures");
        put("neurology", "nervous system, brain, neurological disorders, cognitive function");
        put("oncology", "cancer, tumors, chemotherapy, radiation therapy, oncological treatments");
        put("pediatrics", "children's health, pediatric conditions, child development, vaccination");
        put("psychiatry", "mental health, psychological disorders, therapy, psychiatric medications");
        put("dermatology", "skin conditions, dermatological treatments, skin cancer, allergies");
        put("orthopedics", "bones, joints, muscles, fractures, orthopedic surgery");
        put("gastroenterology", "digestive system, stomach, intestines, liver, gastrointestinal disorders");
        put("endocrinology", "hormones, diabetes, thyroid, endocrine system disorders");
        put("pulmonology", "lungs, respiratory system, breathing disorders, pulmonary conditions");
    }};

    private static final List<String> CRITICAL_SYMPTOMS = Arrays.asList(
        "chest pain", "difficulty breathing", "severe headache", "loss of consciousness",
        "severe bleeding", "stroke symptoms", "heart attack", "anaphylaxis",
        "severe abdominal pain", "high fever", "seizure", "overdose"
    );

    /**
     * Enhance the medical prompt based on detected medical specialty
     */
    public String enhancePromptBySpecialty(String userQuery) {
        String detectedSpecialty = detectMedicalSpecialty(userQuery.toLowerCase());

        if (detectedSpecialty != null) {
            return String.format("""
                    **DETECTED MEDICAL SPECIALTY: %s**
                    Focus on: %s
                    
                    Please provide specialized information relevant to this medical field while maintaining
                    general medical safety guidelines.
                    """,
                    detectedSpecialty.toUpperCase(),
                    MEDICAL_SPECIALTIES.get(detectedSpecialty));
        }

        return "**GENERAL MEDICAL INQUIRY**\nProvide comprehensive medical information covering all relevant aspects.";
    }

    /**
     * Detect medical specialty based on keywords in the query
     */
    private String detectMedicalSpecialty(String query) {
        for (Map.Entry<String, String> entry : MEDICAL_SPECIALTIES.entrySet()) {
            String[] keywords = entry.getValue().split(", ");
            for (String keyword : keywords) {
                if (query.contains(keyword.toLowerCase())) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }

    /**
     * Check if the query contains critical symptoms requiring immediate attention
     */
    public boolean hasCriticalSymptoms(String query) {
        String lowerQuery = query.toLowerCase();
        return CRITICAL_SYMPTOMS.stream()
                .anyMatch(symptom -> lowerQuery.contains(symptom));
    }

    /**
     * Generate medical disclaimer based on query severity
     */
    public String generateMedicalDisclaimer(String query, double confidenceScore) {
        if (hasCriticalSymptoms(query)) {
            return """
                    ⚠️ **IMPORTANT MEDICAL DISCLAIMER:**
                    This response is for informational purposes only and should NOT replace emergency medical care.
                    If you're experiencing these symptoms, please seek immediate medical attention.
                    """;
        }

        if (confidenceScore < 0.5) {
            return """
                    ℹ️ **MEDICAL DISCLAIMER:**
                    This response has lower confidence due to limited context. Please consult with a healthcare
                    professional for accurate diagnosis and treatment recommendations.
                    """;
        }

        return """
                ℹ️ **MEDICAL DISCLAIMER:**
                This information is for educational purposes only. Always consult with qualified healthcare
                professionals for medical advice, diagnosis, and treatment decisions.
                """;
    }

    /**
     * Format medical references for better readability
     */
    public String formatMedicalReferences(List<String> references) {
        if (references == null || references.isEmpty()) {
            return "No specific medical references available.";
        }

        StringBuilder formatted = new StringBuilder("**Medical References:**\n");
        for (int i = 0; i < references.size(); i++) {
            formatted.append(String.format("[%d] %s\n", i + 1, references.get(i)));
        }

        return formatted.toString();
    }
}
