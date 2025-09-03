import axios from 'axios';
import Cookies from 'js-cookie';
import { API_CONFIG, TOKEN_CONFIG } from '../config/apiConfig';

const API_BASE_URL = API_CONFIG.BASE_URL;
const API_URL = `${API_BASE_URL}/api/auth`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling refresh token cookies
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor to add access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${API_URL}/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Handle ApiResponse wrapper
        if (refreshResponse.data.success) {
          const { accessToken } = refreshResponse.data.data;
          localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY, accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY);
        localStorage.removeItem(TOKEN_CONFIG.USER_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const authService = {
  async login(email, password) {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
      );

      // Backend returns ApiResponse wrapper
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        
        // Store access token and user data
        localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(TOKEN_CONFIG.USER_KEY, JSON.stringify(user));

        return { success: true, data: response.data.data };
      } else {
        return {
          success: false,
          error: response.data.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  },

  async register(name, email, password) {
    try {
      const response = await axios.post(
        `${API_URL}/register`,
        { name, email, password },
        { withCredentials: true }
      );

      // Backend returns ApiResponse wrapper
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        
        // Store access token and user data
        localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(TOKEN_CONFIG.USER_KEY, JSON.stringify(user));

        return { success: true, data: response.data.data };
      } else {
        return {
          success: false,
          error: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  },

  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Silently handle logout errors
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY);
      localStorage.removeItem(TOKEN_CONFIG.USER_KEY);
    }
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(TOKEN_CONFIG.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY);
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  getAccessToken() {
    return localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY);
  },

  async changePassword(passwordData) {
    try {
      const response = await api.post('/api/auth/change-password', passwordData);
      
      // Handle ApiResponse wrapper
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to change password. Please try again.');
      }
    }
  }
};

export default authService;
export { api };
