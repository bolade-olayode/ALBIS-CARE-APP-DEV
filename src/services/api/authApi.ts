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

      const text = await response.text();
      let rawData;
      try {
        rawData = JSON.parse(text);
      } catch (e) {
        throw new Error('Server Error: Invalid response format.');
      }

      if (!response.ok || !rawData.success) {
        throw new Error(rawData.message || 'Login failed');
      }

      // Normalize data - extract token and user
      const token = rawData.data?.token || rawData.token;
      const user = rawData.data?.user || rawData.user || rawData.data;

      if (!token) {
        throw new Error('Login successful but no token received.');
      }

      // Store token as backup
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      return {
        success: true,
        token: token,
        user: user
      };

    } catch (error: any) {
      throw error;
    }
  },

  logout: async () => {
    try {
      // Get token before clearing
      const token = await AsyncStorage.getItem('authToken');

      // Call server to invalidate session (fire and forget)
      if (token) {
        fetch('https://albiscare.co.uk/api/v1/auth/logout.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }).catch(() => {
          // Server logout failed - continue with local logout
        });
      }

      // Clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('biometricCredentials');
    } catch (error) {
      // Logout error - still clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
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

  // Request password reset - sends OTP to email
  requestPasswordReset: async (email: string) => {
    try {
      const response = await fetch('https://albiscare.co.uk/api/v1/auth/forgot-password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server error. Please try again.');
      }

      return {
        success: data.success || false,
        message: data.message || 'Request processed',
      };
    } catch (error: any) {
      throw error;
    }
  },

  // Verify OTP code
  verifyOTP: async (email: string, otp: string) => {
    try {
      const response = await fetch('https://albiscare.co.uk/api/v1/auth/verify-otp.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server error. Please try again.');
      }

      return {
        success: data.success || false,
        message: data.message || 'Verification processed',
        resetToken: data.reset_token || null,
      };
    } catch (error: any) {
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (email: string, resetToken: string, newPassword: string) => {
    try {
      const response = await fetch('https://albiscare.co.uk/api/v1/auth/reset-password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          reset_token: resetToken,
          new_password: newPassword,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server error. Please try again.');
      }

      return {
        success: data.success || false,
        message: data.message || 'Password reset processed',
      };
    } catch (error: any) {
      throw error;
    }
  },

  // Store biometric preference
  setBiometricEnabled: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('biometricEnabled', JSON.stringify(enabled));
    } catch (error) {
      // Silently handle storage error
    }
  },

  // Get biometric preference
  isBiometricEnabled: async () => {
    try {
      const value = await AsyncStorage.getItem('biometricEnabled');
      return value ? JSON.parse(value) : false;
    } catch (error) {
      return false;
    }
  },

  // Store credentials for biometric login
  storeCredentialsForBiometric: async (email: string, password: string) => {
    try {
      await AsyncStorage.setItem('biometricCredentials', JSON.stringify({ email, password }));
    } catch (error) {
      // Silently handle storage error
    }
  },

  // Get stored credentials for biometric login
  getBiometricCredentials: async () => {
    try {
      const value = await AsyncStorage.getItem('biometricCredentials');
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  },

  // Clear biometric credentials
  clearBiometricCredentials: async () => {
    try {
      await AsyncStorage.removeItem('biometricCredentials');
      await AsyncStorage.removeItem('biometricEnabled');
    } catch (error) {
      // Silently handle storage error
    }
  },

  // Change password (for logged-in users)
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch('https://albiscare.co.uk/api/v1/auth/change-password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server error. Please try again.');
      }

      return {
        success: data.success || false,
        message: data.message || 'Password change processed',
      };
    } catch (error: any) {
      throw error;
    }
  },

  // Remember email preference
  setRememberedEmail: async (email: string | null) => {
    try {
      if (email) {
        await AsyncStorage.setItem('rememberedEmail', email);
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
      }
    } catch (error) {
      // Silently handle storage error
    }
  },

  // Get remembered email
  getRememberedEmail: async () => {
    try {
      return await AsyncStorage.getItem('rememberedEmail');
    } catch (error) {
      return null;
    }
  },
};