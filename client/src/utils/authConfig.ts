import { LogLevel } from '@azure/msal-browser';
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
    clientId: '41e5ac64-8a93-40a4-a204-352f1299b7be', // This is the ONLY mandatory field that you need to supply.
    authority: b2cPolicies.authorities.signUpSignIn.authority, // Choose SUSI as your default authority.
    knownAuthorities: [b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
    redirectUri: '/', // You must register this URI on Azure Portal/App Registration. Defaults to window.location.origin
    postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
    navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
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
