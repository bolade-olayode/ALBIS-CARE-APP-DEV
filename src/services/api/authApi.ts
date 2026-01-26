// src/services/api/authApi.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
// We remove the strict LoginResponse return type here to avoid the conflict
// or you can define a strict return type if you prefer.

const LOGIN_URL = 'https://albiscare.co.uk/api/v1/auth/login.php';

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      console.log('=== AUTH API: Starting Login ===');

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
      console.log('=== AUTH API: Raw Response ===');
      console.log('Response text:', text.substring(0, 500));

      let rawData;
      try {
        rawData = JSON.parse(text);
      } catch (e) {
        throw new Error('Server Error: Invalid response format.');
      }

      console.log('=== AUTH API: Parsed Response ===');
      console.log('rawData:', JSON.stringify(rawData, null, 2));
      console.log('rawData.data:', JSON.stringify(rawData.data, null, 2));
      console.log('rawData.token:', rawData.token);
      console.log('rawData.data?.token:', rawData.data?.token);

      // 2. Check Success
      if (!response.ok || !rawData.success) {
        throw new Error(rawData.message || 'Login failed');
      }

      // 3. NORMALIZE DATA HERE (The Fix)
      // We extract the token and user right here, so the UI gets clean data.
      const token = rawData.data?.token || rawData.token;
      const user = rawData.data?.user || rawData.user || rawData.data;

      console.log('=== AUTH API: Extracted Values ===');
      console.log('Extracted token:', token ? `${token.substring(0, 30)}...` : 'NULL/UNDEFINED');
      console.log('Token type:', typeof token);
      console.log('Token length:', token?.length);

      if (!token) {
        console.error('!!! NO TOKEN IN RESPONSE !!!');
        console.error('Check rawData structure above');
        throw new Error('Login successful but no token received.');
      }

      // 4. ALSO store token here as backup (in case AppNavigator fails)
      console.log('=== AUTH API: Storing token as backup ===');
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      // Verify storage worked
      const verifyToken = await AsyncStorage.getItem('authToken');
      console.log('Backup storage verification:', verifyToken ? 'SUCCESS' : 'FAILED');

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