import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '3dd4e88e-63c3-49b3-af56-f2770cf498a8',
    redirectUri: 'http://localhost:3000/',
    postLogoutRedirectUri: 'http://localhost:3000/',
    authority:
      'https://orcanext.b2clogin.com/orcanext.onmicrosoft.com/B2C_1_orca_signin', // Choose SUSI as your default authority.
    knownAuthorities: ['orcanext.b2clogin.com'], // Mark your B2C tenant's domain as trusted.
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
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
