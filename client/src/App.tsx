import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import HomePage from './components/dashboard';
import GoalsPage from './components/goals/MainGoalPage';
import AppLayout from './components/nav/AppLayout';

import { msalConfig } from './utils/authConfig';

import '@fontsource/varela-round';
import './App.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path='/'
        element={
          <AppLayout>
            <HomePage />
          </AppLayout>
        }
        // errorElement={({ children }) => <>{children}</>}
      />
      <Route
        path='/goals'
        element={
          <AppLayout>
            <GoalsPage />
          </AppLayout>
        }
        // errorElement={({ children }) => <>{children}</>}
      />
    </>
  )
);

const msalInstance = new PublicClientApplication(msalConfig);
msalInstance.initialize();
function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <RouterProvider router={router} />;
    </MsalProvider>
  );
}

export default App;
