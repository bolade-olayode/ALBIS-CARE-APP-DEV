// src/services/api/apiClient.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized - clear credentials and force re-login
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // The app will redirect to login on next navigation check
    }

    // Handle 403 Forbidden - access denied
    if (error.response?.status === 403) {
      error.message = 'Access denied. You do not have permission for this action.';
    }

    // Handle 429 Too Many Requests - rate limiting
    if (error.response?.status === 429) {
      error.message = 'Too many requests. Please wait and try again.';
    }

    // Handle 500+ Server errors
    if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;