// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh-token',
      LOGOUT: '/api/auth/logout'
    },
    CHAT: {
      MESSAGE: '/api/chat/message',
      SESSIONS: '/api/chat/sessions',
      SESSION_BY_ID: (id) => `/api/chat/sessions/${id}`,
      DELETE_SESSION: (id) => `/api/chat/sessions/${id}`,
      NEW_SESSION: '/api/chat/sessions/new',
      ASK: '/api/chat/ask', // Legacy endpoint
      HEALTH: '/api/chat/health'
    },
    PDF: {
      UPLOAD: '/api/pdf/upload',
      STATUS: '/api/pdf/status',
      DOCUMENTS: '/api/pdf/documents'
    }
  }
};

// Token Configuration
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: 'accessToken',
  USER_KEY: 'user',
  REFRESH_COOKIE_NAME: 'refresh_token',
  ACCESS_TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutes in milliseconds
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Medical AI Assistant',
  VERSION: '1.0.0',
  FEATURES: {
    CHAT_SESSIONS: true,
    PDF_UPLOAD: true,
    MEDICAL_DISCLAIMER: true
  }
};

export default API_CONFIG;
