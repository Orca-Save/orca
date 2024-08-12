import { NavigationClient } from '@azure/msal-browser';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

export class CustomNavigationClient extends NavigationClient {
  async navigateExternal(url: string, options: any) {
    // @ts-ignore
    if (window.Capacitor) {
      // Use Capacitor Browser plugin
      await Browser.open({ url });

      const appUrlOpenListener = (data: any) => {
        if (data.url && data.url.includes('#state')) {
          // Close the in-app browser
          Browser.close();

          // Redirect to localhost with the state parameter
          const domain = data.url.split('#')[0];
          const newUrl = data.url.replace(
            domain,
            'http://localhost/msal-login'
          );
          window.location.href = newUrl;
        }
      };

      // Listen for the app URL to be opened
      CapacitorApp.addListener('appUrlOpen', appUrlOpenListener);

      // Clean up the listener after navigation is complete
      return true;
    } else {
      // Fallback for non-Capacitor environments
      if (options.noHistory) {
        window.location.replace(url);
      } else {
        window.location.assign(url);
      }
      return true;
    }
  }
}
