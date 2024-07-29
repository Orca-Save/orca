import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';

import HomePage from './components/dashboard';
import GoalsPage from './components/goals/MainGoalPage';
import NavTabs from './components/log/NavTabs';
import AppLayout from './components/nav/AppLayout';

import { msalConfig } from './utils/authConfig';

import '@fontsource/varela-round';
import './App.css';
const LayoutRoute = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

const LogLayoutRoute = () => (
  <>
    <NavTabs />
    <Outlet />
  </>
);
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<LayoutRoute />}>
      <Route index element={<HomePage />} />
      <Route path='goals' element={<GoalsPage />} />
      <Route path='log' element={<LogLayoutRoute />}>
        <Route path='savings' element={<GoalsPage />} />
      </Route>
    </Route>
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
