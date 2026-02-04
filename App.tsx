import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';

export default function App() {
  const navigationRef = useRef<any>(null);
  const notificationCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Setup notification listeners
    notificationCleanup.current = notificationService.setupNotificationListeners(
      // Handle notification received while app is in foreground
      (notification) => {
        console.log('Foreground notification:', notification.request.content.title);
        // You could show an in-app alert here if desired
      },
      // Handle notification tap (user interaction)
      (response) => {
        const navData = notificationService.getNavigationFromNotification(response);
        if (navData && navigationRef.current) {
          // Navigate to the appropriate screen
          navigationRef.current.navigate(navData.screen, navData.params);
        }
      }
    );

    // Check for notification that launched the app (cold start)
    notificationService.getInitialNotification().then((response) => {
      if (response) {
        const navData = notificationService.getNavigationFromNotification(response);
        if (navData && navigationRef.current) {
          // Small delay to ensure navigation is fully ready
          setTimeout(() => {
            navigationRef.current?.navigate(navData.screen, navData.params);
          }, 1000);
        }
      }
    });

    // Cleanup on unmount
    return () => {
      if (notificationCleanup.current) {
        notificationCleanup.current();
      }
    };
  }, []);

  return (
    <>
      <AppNavigator navigationRef={navigationRef} />
      <StatusBar style="auto" />
    </>
  );
}