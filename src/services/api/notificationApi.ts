// src/services/api/notificationApi.ts

import apiClient from './apiClient';

interface NotificationApiResponse {
  success: boolean;
  message?: string;
  data?: {
    token_id?: number;
    action?: 'created' | 'updated';
    deactivated_count?: number;
  };
}

interface NotificationHistoryItem {
  id: number;
  notification_type: string;
  title: string;
  body: string;
  status: 'sent' | 'failed';
  created_at: string;
}

interface NotificationHistoryResponse {
  success: boolean;
  message?: string;
  data?: {
    notifications: NotificationHistoryItem[];
    total: number;
  };
}

export const notificationApi = {
  /**
   * Register a push token with the backend
   * Called after successful login when we have the Expo push token
   */
  registerToken: async (
    expoPushToken: string,
    deviceType: string,
    deviceName?: string
  ): Promise<NotificationApiResponse> => {
    try {
      const response = await apiClient.post('/v1/notifications/register-token.php', {
        expo_push_token: expoPushToken,
        device_type: deviceType,
        device_name: deviceName,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to register token',
      };
    }
  },

  /**
   * Unregister a push token from the backend
   * Called on logout to stop receiving notifications on this device
   * If no token is provided, deactivates all tokens for the user
   */
  unregisterToken: async (expoPushToken?: string): Promise<NotificationApiResponse> => {
    try {
      const response = await apiClient.post('/v1/notifications/unregister-token.php', {
        expo_push_token: expoPushToken,
      });
      return response.data;
    } catch (error: any) {
      console.error('Unregister token API error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to unregister token',
      };
    }
  },

  /**
   * Get notification history for the current user
   * Optional endpoint - useful for showing notification history in-app
   */
  getNotificationHistory: async (limit: number = 50): Promise<NotificationHistoryResponse> => {
    try {
      const response = await apiClient.get(`/v1/notifications/history.php?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Get notification history API error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch history',
      };
    }
  },
};
