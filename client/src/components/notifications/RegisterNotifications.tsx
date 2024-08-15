import React from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export function RegisterNotifications() {
  usePushNotifications();
  return <React.Fragment />;
}
