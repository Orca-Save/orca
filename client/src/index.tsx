import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { reactPlugin } from './utils/appInsightsClient';
import { msalConfig } from './utils/authConfig';
import { CustomNavigationClient } from './utils/navigationClient';

import './index.css';

//@ts-ignore
const msalInstance = new PublicClientApplication(msalConfig);
const initializeApp = async () => {
  // Set the custom navigation client
  const navigationClient = new CustomNavigationClient();
  msalInstance.setNavigationClient(navigationClient);

  // Await initialization of MSAL
  await msalInstance.initialize();

  // Handle the redirect promise (if applicable)
  const authResult = await msalInstance.handleRedirectPromise();

  console.debug('AuthResult ---->', authResult);
  if (!authResult) {
    msalInstance.loginRedirect();
  }

  // Render the React app
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <AppInsightsContext.Provider value={reactPlugin}>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </AppInsightsContext.Provider>
    </React.StrictMode>
  );
};

// Call the async initialization function
initializeApp().catch((error) => {
  console.error('Error during MSAL initialization:', error);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
