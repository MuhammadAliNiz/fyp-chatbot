# 📋 Complete API Documentation

## 🌐 Base URL
```
http://localhost:8080/api
```

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Token Management
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days) - stored in HTTP-only cookie
- **Automatic Refresh**: Frontend automatically refreshes tokens

---

## 🔑 Authentication Endpoints

### 1. Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900000,
    "user": {
      "id": 1,
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "role": "USER"
    }
  }
}
```

**Status Codes:**
- `201 Created` - Registration successful
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists

---

### 2. Login
Authenticate user and receive access token.

**Endpoint:** `POST /auth/authenticate`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900000,
    "user": {
      "id": 1,
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "role": "USER"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Authentication successful
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - User not found

---

### 3. Refresh Token
Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh-token`

**Headers:**
```
Cookie: refresh_token=<refresh_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900000
  }
}
```

**Status Codes:**
- `200 OK` - Token refreshed successfully
- `401 Unauthorized` - Invalid refresh token
- `403 Forbidden` - Refresh token expired

---

### 4. Logout
Invalidate current session and clear refresh token.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**Status Codes:**
- `200 OK` - Logout successful

---

### 5. Change Password
Change user password (requires current password).

**Endpoint:** `PATCH /auth/change-password`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456",
  "confirmationPassword": "newSecurePassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**Status Codes:**
- `200 OK` - Password changed successfully
- `400 Bad Request` - Password validation failed
- `401 Unauthorized` - Current password incorrect

---

## 🤖 Chat Endpoints

### 1. Send Chat Message
Send a message to the RAG chatbot and receive AI response.

**Endpoint:** `POST /chat`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "message": "What are the symptoms of diabetes?",
  "sessionId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat response generated successfully",
  "data": {
    "id": "msg_001",
    "response": "Diabetes symptoms include increased thirst, frequent urination, extreme fatigue, blurred vision, and slow-healing wounds. Based on the medical documents, early detection is crucial for proper management.",
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": "2025-09-03T10:30:00Z",
    "sources": [
      {
        "documentName": "diabetes_guide.pdf",
        "pageNumber": 15,
        "relevanceScore": 0.92
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Message processed successfully
- `400 Bad Request` - Invalid message or session ID
- `401 Unauthorized` - Authentication required
- `500 Internal Server Error` - AI service unavailable

---

### 2. Get Chat History
Retrieve chat history for a specific session.

**Endpoint:** `GET /chat/history/{sessionId}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `sessionId` (UUID) - Chat session identifier

**Response:**
```json
{
  "success": true,
  "message": "Chat history retrieved successfully",
  "data": {
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "messages": [
      {
        "id": "msg_001",
        "userMessage": "What are the symptoms of diabetes?",
        "botResponse": "Diabetes symptoms include...",
        "timestamp": "2025-09-03T10:30:00Z",
        "sources": [...]
      }
    ],
    "totalMessages": 5,
    "createdAt": "2025-09-03T10:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - History retrieved successfully
- `404 Not Found` - Session not found
- `401 Unauthorized` - Authentication required

---

### 3. List Chat Sessions
Get all chat sessions for the authenticated user.

**Endpoint:** `GET /chat/sessions`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 0)
- `size` (optional) - Page size (default: 20)
- `sort` (optional) - Sort field (default: createdAt)

**Response:**
```json
{
  "success": true,
  "message": "Chat sessions retrieved successfully",
  "data": {
    "sessions": [
      {
        "sessionId": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Diabetes Discussion",
        "messageCount": 5,
        "lastActivity": "2025-09-03T10:30:00Z",
        "createdAt": "2025-09-03T10:00:00Z"
      }
    ],
    "totalSessions": 10,
    "currentPage": 0,
    "totalPages": 1
  }
}
```

**Status Codes:**
- `200 OK` - Sessions retrieved successfully
- `401 Unauthorized` - Authentication required

---

### 4. Delete Chat Session
Delete a specific chat session and all its messages.

**Endpoint:** `DELETE /chat/sessions/{sessionId}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `sessionId` (UUID) - Chat session identifier

**Response:**
```json
{
  "success": true,
  "message": "Chat session deleted successfully",
  "data": null
}
```

**Status Codes:**
- `200 OK` - Session deleted successfully
- `404 Not Found` - Session not found
- `401 Unauthorized` - Authentication required

---

## 👨‍💼 Admin Endpoints

**Note:** All admin endpoints require `ADMIN` role.

### 1. Upload Single PDF
Upload a single PDF document to the knowledge base.

**Endpoint:** `POST /admin/upload-pdf`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <PDF file> (max 50MB)
```

**Response:**
```json
{
  "success": true,
  "message": "PDF uploaded and processed successfully",
  "data": {
    "fileName": "medical_guide.pdf",
    "fileSize": 2048576,
    "chunksCreated": 45,
    "processingTime": 1250,
    "vectorsStored": 45,
    "status": "SUCCESS"
  }
}
```

**Status Codes:**
- `200 OK` - Upload successful
- `400 Bad Request` - Invalid file or file too large
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin role required
- `500 Internal Server Error` - Processing failed

---

### 2. Upload Multiple PDFs
Upload multiple PDF documents at once.

**Endpoint:** `POST /admin/upload-multiple-pdfs`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
files: <PDF files array> (max 50MB each)
```

**Response:**
```json
{
  "success": true,
  "message": "Multiple PDFs processed successfully",
  "data": {
    "totalFiles": 3,
    "successfulUploads": 2,
    "failedUploads": 1,
    "results": [
      {
        "fileName": "guide1.pdf",
        "status": "SUCCESS",
        "chunksCreated": 25,
        "fileSize": 1024000
      },
      {
        "fileName": "guide2.pdf",
        "status": "SUCCESS",
        "chunksCreated": 30,
        "fileSize": 1536000
      },
      {
        "fileName": "corrupt.pdf",
        "status": "FAILED",
        "error": "File is corrupted or not a valid PDF"
      }
    ],
    "totalProcessingTime": 3500
  }
}
```

**Status Codes:**
- `200 OK` - Processing completed (check individual results)
- `400 Bad Request` - Invalid files
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin role required

---

### 3. Get Dashboard Statistics
Retrieve admin dashboard statistics and system health.

**Endpoint:** `GET /admin/dashboard`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "totalUsers": 150,
    "totalDocuments": 25,
    "totalVectors": 1250,
    "systemHealth": {
      "database": "HEALTHY",
      "vectorStore": "HEALTHY",
      "aiService": "HEALTHY"
    },
    "recentActivity": {
      "newUsersToday": 5,
      "documentsUploadedToday": 2,
      "chatMessagesToday": 45
    },
    "storageStats": {
      "documentsStorageUsed": "125MB",
      "vectorStorageUsed": "45MB",
      "totalStorageAvailable": "10GB"
    },
    "lastUpdated": "2025-09-03T10:45:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Statistics retrieved successfully
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin role required

---

### 4. Test Vector Store Connection
Test the connection and functionality of the vector database.

**Endpoint:** `GET /admin/test-vectorstore`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "VectorStore test completed",
  "data": {
    "connectionStatus": "CONNECTED",
    "indexName": "chatbot1",
    "namespace": "default",
    "vectorCount": 1250,
    "searchTestResult": "SUCCESS",
    "responseTime": 150,
    "lastTestRun": "2025-09-03T10:45:00Z",
    "configuration": {
      "environment": "us-east-1-aws",
      "dimensionality": 1536,
      "metric": "cosine"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Test completed successfully
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin role required
- `500 Internal Server Error` - Vector store connection failed

---

### 5. Get All Users
Retrieve a list of all registered users (admin only).

**Endpoint:** `GET /admin/users`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 0)
- `size` (optional) - Page size (default: 20)
- `sort` (optional) - Sort field (default: createdAt)
- `search` (optional) - Search term for name or email

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "firstname": "John",
        "lastname": "Doe",
        "email": "john.doe@example.com",
        "role": "USER",
        "isEnabled": true,
        "lastLogin": "2025-09-03T09:30:00Z",
        "createdAt": "2025-09-01T10:00:00Z"
      }
    ],
    "totalUsers": 150,
    "currentPage": 0,
    "totalPages": 8
  }
}
```

**Status Codes:**
- `200 OK` - Users retrieved successfully
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin role required

---

### 6. Update User Role
Change a user's role (USER/ADMIN).

**Endpoint:** `PUT /admin/users/{userId}/role`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Path Parameters:**
- `userId` (Long) - User identifier

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "role": "ADMIN",
    "updatedAt": "2025-09-03T10:45:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Role updated successfully
- `400 Bad Request` - Invalid role value
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin role required
- `404 Not Found` - User not found

---

### 7. Delete User
Delete a user account (admin only).

**Endpoint:** `DELETE /admin/users/{userId}`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Path Parameters:**
- `userId` (Long) - User identifier

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

**Status Codes:**
- `200 OK` - User deleted successfully
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin role required
- `404 Not Found` - User not found
- `409 Conflict` - Cannot delete admin user

---

### 8. Health Check
Check admin service health and system status.

**Endpoint:** `GET /admin/health`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Admin service is operational",
  "data": "All systems operational"
}
```

**Status Codes:**
- `200 OK` - Service is healthy
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin role required

---

### 9. Debug Authentication
Get detailed authentication information for debugging.

**Endpoint:** `GET /admin/debug-auth`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication debug info retrieved",
  "data": {
    "username": "admin@admin.com",
    "authorities": ["ROLE_ADMIN", "ROLE_USER"],
    "isAuthenticated": true,
    "principalType": "UserDetails",
    "tokenIssuedAt": "2025-09-03T10:00:00Z",
    "tokenExpiresAt": "2025-09-03T10:15:00Z",
    "sessionInfo": {
      "sessionId": "sess_123456",
      "remoteAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0..."
    }
  }
}
```

**Status Codes:**
- `200 OK` - Debug info retrieved successfully
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin role required

---

## 📊 Standard Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data object
  },
  "timestamp": "2025-09-03T10:45:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "errorCode": "ERROR_CODE",
  "timestamp": "2025-09-03T10:45:00Z"
}
```

---

## 🚨 Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_001` | Invalid credentials | 401 |
| `AUTH_002` | Token expired | 401 |
| `AUTH_003` | Insufficient permissions | 403 |
| `VALID_001` | Validation failed | 400 |
| `USER_001` | User not found | 404 |
| `USER_002` | Email already exists | 409 |
| `FILE_001` | File too large | 400 |
| `FILE_002` | Invalid file format | 400 |
| `AI_001` | AI service unavailable | 500 |
| `VECTOR_001` | Vector store connection failed | 500 |
| `DB_001` | Database connection failed | 500 |

---

## 🔧 Rate Limiting

| Endpoint Type | Rate Limit | Window |
|---------------|------------|---------|
| Authentication | 5 requests | 1 minute |
| Chat | 30 requests | 1 minute |
| PDF Upload | 10 requests | 1 hour |
| Admin Operations | 100 requests | 1 hour |

---

## 📝 Request/Response Examples

### File Upload with Progress Tracking
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('/api/admin/upload-pdf', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const result = await response.json();
console.log('Upload result:', result);
```

### Chat with Streaming Response
```javascript
const chatData = {
  message: "What are the symptoms of diabetes?",
  sessionId: "uuid-session-id"
};

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(chatData)
});

const result = await response.json();
console.log('AI Response:', result.data.response);
```

---

## 🛡️ Security Notes

1. **Always use HTTPS** in production environments
2. **Store refresh tokens securely** (HTTP-only cookies)
3. **Validate file uploads** on both client and server
4. **Implement rate limiting** to prevent abuse
5. **Log security events** for monitoring
6. **Use strong JWT secrets** in production
7. **Regularly rotate API keys** for external services

---

## 📞 Support

For API-related questions:
1. Check this documentation first
2. Review error messages and codes
3. Test endpoints using tools like Postman
4. Submit issues on GitHub with detailed information

---

**Last Updated:** September 3, 2025
**API Version:** 1.0.0
