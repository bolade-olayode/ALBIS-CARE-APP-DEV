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
    // Get token from storage
    const token = await AsyncStorage.getItem('authToken');

    console.log('=== API CLIENT REQUEST ===');
    console.log('URL:', config.url);
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'NULL');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization?.substring(0, 30) + '...');
    } else {
      console.log('WARNING: No token found in AsyncStorage!');
    }
    console.log('==========================');

    return config;
  },
  (error) => {
    console.error('API Client Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log('=== API CLIENT ERROR ===');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    console.log('URL:', error.config?.url);
    console.log('========================');

    // DISABLED: Auto-clear was causing cascade failures
    // The 401 was being triggered by header not reaching backend (server config issue)
    // Only clear on explicit logout, not on API errors
    // if (error.response?.status === 401) {
    //   await AsyncStorage.removeItem('authToken');
    //   await AsyncStorage.removeItem('userData');
    // }

    return Promise.reject(error);
  }
);

export default apiClient;