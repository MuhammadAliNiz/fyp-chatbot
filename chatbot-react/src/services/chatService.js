import { api } from './authService';

const chatService = {
  // Send a chat message (main endpoint)
  async sendMessage(message, sessionId = null, sessionTitle = null) {
    try {
      const response = await api.post('/api/chat/message', {
        message,
        sessionId,
        sessionTitle
      });

      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send message'
      };
    }
  },

  // Create a new chat session
  async createNewChatSession(title = 'New Chat') {
    try {
      const response = await api.post('/api/chat/sessions', {
        title
      });

      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create new session'
      };
    }
  },

  // Start a new session with first message
  async startNewSessionWithMessage(message, sessionTitle = null) {
    try {
      const response = await api.post('/api/chat/sessions/new', {
        message,
        sessionTitle
      });

      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to start new session'
      };
    }
  },

  // Get all chat sessions for current user
  async getChatSessions() {
    try {
      const response = await api.get('/api/chat/sessions');
      return { 
        success: response.data.success, 
        data: response.data.data 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get chat sessions'
      };
    }
  },

  // Get specific chat session with messages
  async getChatSession(sessionId) {
    try {
      const response = await api.get(`/api/chat/sessions/${sessionId}`);
      return { 
        success: response.data.success, 
        data: response.data.data 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get chat session'
      };
    }
  },

  // Delete a chat session
  async deleteChatSession(sessionId) {
    try {
      const response = await api.delete(`/api/chat/sessions/${sessionId}`);
      return { 
        success: response.data.success,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete chat session'
      };
    }
  },

  // Start a new chat session
  async startNewSession(message, sessionTitle) {
    try {
      const response = await api.post('/api/chat/sessions/new', {
        message,
        sessionTitle
      });

      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to start new session'
      };
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/api/chat/health');
      return { 
        success: response.data.success, 
        data: response.data.data 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Health check failed'
      };
    }
  },

  // Legacy method for backward compatibility
  async askQuestion(query) {
    try {
      const response = await api.get('/api/chat/ask', {
        params: { query }
      });
      return { 
        success: response.data.success, 
        data: response.data.data 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get response'
      };
    }
  }
};

export default chatService;
