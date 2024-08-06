import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { reactPlugin } from './utils/appInsightsClient';
import { msalConfig } from './utils/authConfig';

import './index.css';

const msalInstance = new PublicClientApplication(msalConfig);
msalInstance.initialize();
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
