// src/services/notificationService.ts

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationApi } from './api/notificationApi';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  screen?: string;
  params?: Record<string, any>;
  notification_type?: string;
  visit_id?: number;
  transport_id?: number;
  log_id?: number;
  client_id?: number;
  timestamp?: string;
}

export const notificationService = {
  /**
   * Request notification permissions and get Expo push token
   * Returns the token string or null if failed/denied
   */
  registerForPushNotifications: async (): Promise<string | null> => {
    // Only register on physical devices
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '1f544fe9-37dd-4dde-9aa4-510d0ca9ead8',
      });

      const expoPushToken = tokenData.data;
      console.log('Expo push token:', expoPushToken);

      // Configure Android notification channels
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563eb',
        });

        await Notifications.setNotificationChannelAsync('visit-reminders', {
          name: 'Visit Reminders',
          description: 'Reminders for upcoming care visits',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('assignments', {
          name: 'New Assignments',
          description: 'Notifications for new visit or transport assignments',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('care-updates', {
          name: 'Care Updates',
          description: 'Updates about care visits for family members',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }

      return expoPushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  },

  /**
   * Register push token with backend server
   */
  registerTokenWithBackend: async (expoPushToken: string): Promise<boolean> => {
    try {
      // Small delay to ensure auth token is fully saved to AsyncStorage
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify auth token exists before making the call
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        return false;
      }

      const response = await notificationApi.registerToken(
        expoPushToken,
        Platform.OS,
        Device.modelName || 'Unknown Device'
      );

      if (response.success) {
        // Store token locally for reference
        await AsyncStorage.setItem('expoPushToken', expoPushToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Push token registration error:', error);
      return false;
    }
  },

  /**
   * Unregister push token (call on logout)
   */
  unregisterToken: async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('expoPushToken');

      if (token) {
        await notificationApi.unregisterToken(token);
        console.log('Push token unregistered');
      }

      await AsyncStorage.removeItem('expoPushToken');
    } catch (error) {
      console.error('Error unregistering push token:', error);
    }
  },

  /**
   * Setup notification listeners
   * Returns cleanup function to remove listeners
   */
  setupNotificationListeners: (
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ): (() => void) => {
    // Listener for notifications received while app is foregrounded
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification.request.content.title);
        onNotificationReceived(notification);
      }
    );

    // Listener for user interaction with notification (tap)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('User tapped notification:', response.notification.request.content.title);
        onNotificationResponse(response);
      }
    );

    // Return cleanup function
    return () => {
      Notifications.removeNotificationSubscription(receivedSubscription);
      Notifications.removeNotificationSubscription(responseSubscription);
    };
  },

  /**
   * Get the notification that launched the app (if any)
   */
  getInitialNotification: async (): Promise<Notifications.NotificationResponse | null> => {
    const response = await Notifications.getLastNotificationResponseAsync();
    return response;
  },

  /**
   * Extract navigation data from notification for deep linking
   */
  getNavigationFromNotification: (
    notification: Notifications.Notification | Notifications.NotificationResponse
  ): { screen: string; params: Record<string, any> } | null => {
    let data: NotificationData;

    if ('notification' in notification) {
      // NotificationResponse (user tapped)
      data = notification.notification.request.content.data as NotificationData;
    } else {
      // Notification (received)
      data = notification.request.content.data as NotificationData;
    }

    // If screen is specified directly, use it
    if (data?.screen) {
      return {
        screen: data.screen,
        params: data.params || {},
      };
    }

    // Fallback: determine screen from notification type
    if (data?.notification_type) {
      switch (data.notification_type) {
        case 'visit_reminder':
          return {
            screen: 'VisitExecution',
            params: { visitId: data.visit_id },
          };
        case 'new_assignment':
        case 'schedule_change':
          return {
            screen: 'VisitDetail',
            params: { visitId: data.visit_id },
          };
        case 'transport_assignment':
          return {
            screen: 'TransportExecution',
            params: { transportId: data.transport_id },
          };
        case 'care_log_complete':
          return {
            screen: 'CareLogDetail',
            params: { logId: data.log_id },
          };
        default:
          return null;
      }
    }

    return null;
  },

  /**
   * Clear all notifications from notification center
   */
  clearAllNotifications: async (): Promise<void> => {
    await Notifications.dismissAllNotificationsAsync();
  },

  /**
   * Set badge count (iOS primarily)
   */
  setBadgeCount: async (count: number): Promise<void> => {
    await Notifications.setBadgeCountAsync(count);
  },

  /**
   * Get current badge count
   */
  getBadgeCount: async (): Promise<number> => {
    return await Notifications.getBadgeCountAsync();
  },

  /**
   * Check if notifications are enabled
   */
  areNotificationsEnabled: async (): Promise<boolean> => {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  },
};
