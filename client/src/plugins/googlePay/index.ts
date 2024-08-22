import { registerPlugin } from '@capacitor/core';
import { GooglePayPlugin } from './definition';

const GooglePay = registerPlugin<GooglePayPlugin>('GooglePay', {
  web: () => console.log('GooglePay not available on web'),
});

export * from './definition';
export { GooglePay };
