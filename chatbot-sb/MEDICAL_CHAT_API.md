# Medical RAG Chatbot API Documentation

## Overview
Enhanced medical RAG chatbot with chat history, session management, and specialized medical prompt templates.

## New Features
- ✅ Medical-specific prompt templates with specialty detection
- ✅ Chat session management with history
- ✅ Emergency keyword detection and safety protocols
- ✅ Confidence scoring based on context quality
- ✅ Source reference tracking
- ✅ Enhanced security with user-specific sessions

## API Endpoints

### 1. Send Chat Message
**POST** `/api/chat/message`

Send a message to the medical chatbot with optional session context.

**Request Body:**
```json
{
  "message": "What are the symptoms of diabetes?",
  "sessionId": "optional-uuid-for-existing-session",
  "sessionTitle": "Optional title for new session"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message processed successfully",
  "data": {
    "sessionId": "uuid",
    "sessionTitle": "Diabetes symptoms discussion",
    "userMessage": "What are the symptoms of diabetes?",
    "botResponse": "Enhanced medical response with disclaimers...",
    "confidenceScore": 0.85,
    "sourceReferences": ["Medical Knowledge Base", "Diabetes Guidelines"],
    "timestamp": "2025-09-01T10:30:00",
    "isNewSession": true
  }
}
```

### 2. Get User Chat Sessions
**GET** `/api/chat/sessions`

Retrieve all chat sessions for the authenticated user.

**Response:**
```json
{
  "success": true,
  "message": "Chat sessions retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Diabetes symptoms discussion",
      "createdAt": "2025-09-01T10:30:00",
      "updatedAt": "2025-09-01T10:35:00",
      "messageCount": 5,
      "lastMessage": "What are the symptoms of diabetes?"
    }
  ]
}
```

### 3. Get Chat Session with Messages
**GET** `/api/chat/sessions/{sessionId}`

Retrieve a specific chat session with all messages.

**Response:**
```json
{
  "success": true,
  "message": "Chat session retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "Diabetes symptoms discussion",
    "createdAt": "2025-09-01T10:30:00",
    "updatedAt": "2025-09-01T10:35:00",
    "messageCount": 2,
    "messages": [
      {
        "id": "uuid",
        "userMessage": "What are the symptoms of diabetes?",
        "botResponse": "Enhanced medical response...",
        "confidenceScore": 0.85,
        "createdAt": "2025-09-01T10:30:00"
      }
    ]
  }
}
```

### 4. Start New Chat Session
**POST** `/api/chat/sessions/new`

Explicitly start a new chat session.

**Request Body:**
```json
{
  "message": "I have questions about heart health",
  "sessionTitle": "Heart Health Consultation"
}
```

### 5. Delete Chat Session
**DELETE** `/api/chat/sessions/{sessionId}`

Delete a specific chat session and all its messages.

**Response:**
```json
{
  "success": true,
  "message": "Chat session deleted successfully"
}
```

### 6. Health Check
**GET** `/api/chat/health`

Check if the chat service is operational.

### 7. Legacy Endpoint (Deprecated)
**GET** `/api/chat/ask?query=your-question`

Legacy endpoint maintained for backward compatibility.

## Medical Features

### Emergency Detection
- Automatically detects emergency keywords
- Provides immediate emergency response
- Bypasses normal processing for safety

### Medical Specialties Supported
- Cardiology (heart conditions)
- Neurology (brain/nervous system)
- Oncology (cancer)
- Pediatrics (children's health)
- Psychiatry (mental health)
- Dermatology (skin conditions)
- Orthopedics (bones/joints)
- Gastroenterology (digestive system)
- Endocrinology (hormones/diabetes)
- Pulmonology (respiratory system)

### Safety Features
- Medical disclaimers on all responses
- Confidence scoring based on context quality
- Source reference tracking
- Emergency keyword detection
- Professional consultation recommendations

## Authentication
All endpoints require valid JWT authentication with USER role.

## Error Handling
All endpoints return standardized error responses with appropriate HTTP status codes.
