import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
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
import OnboardingPage from './components/onboarding/OnboardingPage';
import MySavingsPage from './components/savings/MySavingsPage';
import OneTapPage from './components/savings/OneTapPage';
import TransactionsPage from './components/transactions/MainTransactionPage';
import { msalConfig } from './utils/authConfig';

import '@fontsource/varela-round';
import './App.css';
import TransactionPage from './components/transactions/TransactionPage';

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
    <>
      <Route path='onboarding' element={<OnboardingPage />} />
      <Route path='/' element={<LayoutRoute />}>
        <Route index element={<HomePage />} />
        <Route path='goals' element={<GoalsPage />} />
        <Route path='log' element={<LogLayoutRoute />}>
          <Route path='savings' element={<MySavingsPage />} />
          <Route path='one-taps' element={<OneTapPage />} />
          <Route path='transactions' element={<TransactionsPage />} />
        </Route>
        <Route path='transactions/:id' element={<TransactionPage />} />
      </Route>
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
