import React from 'react';
import HomePage from './components/dashboard';
import AppLayout from './components/nav/AppLayout';

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './utils/authConfig';

import '@fontsource/varela-round';
import './App.css';

const msalInstance = new PublicClientApplication(msalConfig);
function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AppLayout>
        <HomePage />
      </AppLayout>
    </MsalProvider>
  );
}

export default App;
