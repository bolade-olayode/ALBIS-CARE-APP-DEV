// src/services/api/authApi.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
// We remove the strict LoginResponse return type here to avoid the conflict
// or you can define a strict return type if you prefer.

const LOGIN_URL = 'https://albiscare.co.uk/api/v1/auth/login.php';

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password 
        }),
      });

      // 1. Handle Non-JSON Server Crashes
      const text = await response.text();
      let rawData;
      try {
        rawData = JSON.parse(text);
      } catch (e) {
        throw new Error('Server Error: Invalid response format.');
      }

      // 2. Check Success
      if (!response.ok || !rawData.success) {
        throw new Error(rawData.message || 'Login failed');
      }

      // 3. NORMALIZE DATA HERE (The Fix)
      // We extract the token and user right here, so the UI gets clean data.
      const token = rawData.data?.token || rawData.token;
      const user = rawData.data?.user || rawData.user || rawData.data;

      if (!token) {
        throw new Error('Login successful but no token received.');
      }

      // 4. Store Session
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      // 5. Return Clean Object
      return {
        success: true,
        token: token,
        user: user
      };

    } catch (error: any) {
      console.error('Auth API Error:', error);
      throw error; 
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  isLoggedIn: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token !== null;
    } catch (error) {
      return false;
    }
  },

  getUserData: async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        return JSON.parse(userDataString);
      }
      return null;
    } catch (error) {
      return null;
    }
  },
};