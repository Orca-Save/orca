import { BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { Capacitor } from '@capacitor/core';

export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    'https://orcanext.onmicrosoft.com/orca-api/orca.customer',
  ],
};

export const b2cPolicies = {
  names: {
    signUpSignIn: 'B2C_1_orca_signin',
  },
  authorities: {
    signUpSignIn: {
      authority:
        'https://orcanext.b2clogin.com/orcanext.onmicrosoft.com/B2C_1_orca_signin',
    },
  },
  authorityDomain: 'orcanext.b2clogin.com',
};

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID, // This is the ONLY mandatory field that you need to supply.
    // clientId: process.env.AZURE_AD_CLIENT_ID, // This is the ONLY mandatory field that you need to supply.

    authority: b2cPolicies.authorities.signUpSignIn.authority, // Choose SUSI as your default authority.
    knownAuthorities: [b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
    // redirectUri: '/',
    //@ts-ignore
    redirectUri:
      Capacitor.getPlatform() !== 'web' ? 'orcamoney://auth/callback' : '/', // You must register this URI on Azure Portal/App Registration. Defaults to window.location.origin
    //postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
    navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage, // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            // console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};
