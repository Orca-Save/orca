import { Capacitor } from '@capacitor/core';
import { PushNotification } from '@capacitor/push-notifications';
import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/general';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

interface UsePushNotificationsResult {
  token: string | null;
  notification: PushNotification | null;
  error: string | null;
}

export const usePushNotifications = (): UsePushNotificationsResult => {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const userId = accounts[0]?.localAccountId;
  const [token, setToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<PushNotification | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      console.log('Push notifications are not supported on the web.');
      return;
    }
    if (!isAuthenticated || !userId) {
      console.log('User is not authenticated.');
      return;
    }

    import('@capacitor/push-notifications')
      .then(({ PushNotifications }) => {
        PushNotifications.requestPermissions().then((result) => {
          if (result.receive === 'granted') {
            PushNotifications.register();
          } else {
            setError('Push notification permission not granted');
          }
        });

        PushNotifications.addListener('registration', (token: any) => {
          apiFetch('/api/notifications/registerDeviceToken', 'POST', {
            token: token.value,
          });
          setToken(token.value);
        });

        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Push registration error: ' + JSON.stringify(error));
          setError('Registration failed');
        });

        PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: any) => {
            setNotification(notification);
          }
        );

        PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification: any) => {
            setNotification(notification.notification);
          }
        );

        return () => {
          PushNotifications.removeAllListeners();
        };
      })
      .catch((error) => {
        console.error('Failed to load PushNotifications plugin', error);
        setError('Failed to load PushNotifications plugin');
      });
  }, [isAuthenticated, userId]);

  return { token, notification, error };
};
