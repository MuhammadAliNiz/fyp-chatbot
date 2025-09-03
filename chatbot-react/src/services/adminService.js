import { api } from './authService';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

// Create a special API instance for file uploads with longer timeout
const fileUploadApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: true,
  timeout: 300000, // 5 minutes for large file uploads
});

// Add the same interceptors as the main api instance
fileUploadApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token refresh
fileUploadApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${API_CONFIG.BASE_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.success) {
          const { accessToken } = refreshResponse.data.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return fileUploadApi(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Redirect to login or show authentication error
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const adminService = {
  // Upload single PDF file
  async uploadSinglePdf(file) {
    try {
      console.log('🔄 Admin Single PDF Upload Start:');
      console.log('- File:', file.name, file.size, 'bytes');
      console.log('- File size in MB:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
      
      const formData = new FormData();
      formData.append('file', file);

      console.log('🚀 Making API call to /api/admin/pdf/upload-single...');
      console.log('- Using extended timeout of 5 minutes for large files');

      const response = await fileUploadApi.post('/api/admin/pdf/upload-single', formData);

      console.log('✅ Single PDF Upload Response:', response.data);

      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Single PDF Upload Error:');
      console.error('- Error:', error);
      console.error('- Error code:', error.code);
      console.error('- Status:', error.response?.status);
      console.error('- Data:', error.response?.data);
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Upload timeout: File is too large or connection is slow. Please try with a smaller file or check your internet connection.'
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication failed. Please log in again.'
        };
      } else if (error.response?.status === 413) {
        return {
          success: false,
          error: 'File is too large. Maximum file size is 50MB.'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload PDF'
      };
    }
  },

  // Upload multiple PDF files
  async uploadMultiplePdfs(files) {
    try {
      console.log('🔄 Admin Multiple PDF Upload Start:');
      console.log('- Files count:', files.length);
      let totalSize = 0;
      files.forEach((file, index) => {
        console.log(`- File ${index + 1}: ${file.name} (${file.size} bytes)`);
        totalSize += file.size;
      });
      console.log('- Total size:', (totalSize / (1024 * 1024)).toFixed(2), 'MB');
      
      const formData = new FormData();
      
      // Append each file to the FormData
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
        console.log(`📎 Appended file ${i + 1}: ${files[i].name}`);
      }

      console.log('🚀 Making API call to /api/admin/pdf/upload...');
      console.log('- Using extended timeout for multiple large files');

      const response = await fileUploadApi.post('/api/admin/pdf/upload', formData);

      console.log('✅ Multiple PDF Upload Response:', response.data);

      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Multiple PDF Upload Error:');
      console.error('- Error:', error);
      console.error('- Error code:', error.code);
      console.error('- Status:', error.response?.status);
      console.error('- Data:', error.response?.data);
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Upload timeout: Files are too large or connection is slow. Please try with smaller files or check your internet connection.'
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication failed. Please log in again.'
        };
      } else if (error.response?.status === 413) {
        return {
          success: false,
          error: 'Files are too large. Maximum total size is 50MB per file.'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload PDFs'
      };
    }
  },

  // Get admin dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/api/admin/dashboard');
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard stats'
      };
    }
  },

  // Get all users (existing endpoint)
  async getAllUsers() {
    try {
      const response = await api.get('/api/admin/users');
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch users'
      };
    }
  },

  // Test endpoint
  async testUsersEndpoint() {
    try {
      const response = await api.get('/api/admin/users-test');
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Test failed'
      };
    }
  },

  // Debug authentication
  async debugAuth() {
    try {
      const response = await api.get('/api/admin/debug-auth');
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Auth debug failed'
      };
    }
  },

  // Get specific user
  async getUser(userId) {
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user'
      };
    }
  },

  // Get all roles
  async getAllRoles() {
    try {
      const response = await api.get('/api/admin/users/roles');
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch roles'
      };
    }
  },

  // Add role to user
  async addRoleToUser(userId, roleType) {
    try {
      const response = await api.post(`/api/admin/users/${userId}/roles/${roleType}`);
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add role'
      };
    }
  },

  // Remove role from user
  async removeRoleFromUser(userId, roleType) {
    try {
      const response = await api.delete(`/api/admin/users/${userId}/roles/${roleType}`);
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove role'
      };
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete user'
      };
    }
  },

  // Toggle user status (enable/disable)
  async toggleUserStatus(userId, enabled) {
    try {
      const response = await api.put(`/api/admin/users/${userId}/status?enabled=${enabled}`);
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user status'
      };
    }
  },

  // Get user chat history
  async getUserChatHistory(userId) {
    try {
      const response = await api.get(`/api/admin/users/${userId}/chat-history`);
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch chat history'
      };
    }
  },

  // Update user role (existing endpoint)
  async updateUserRole(userId, roleId) {
    try {
      const response = await api.put(`/api/admin/users/${userId}/role`, {
        roleId: roleId
      });
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user role'
      };
    }
  },

  // Admin health check
  async healthCheck() {
    try {
      const response = await api.get('/api/admin/health');
      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Admin service unavailable'
      };
    }
  }
};

export default adminService;
