import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';

import HomePage from './components/dashboard';
import EditGoalPage from './components/goals/EditGoalPage';
import GoalsPage from './components/goals/MainGoalPage';
import NavTabs from './components/log/NavTabs';
import AppLayout from './components/nav/AppLayout';
import OnboardingPage from './components/onboarding/OnboardingPage';
import PrivacyPolicyPage from './components/privacy-policy';
import ReviewPage from './components/review/ReviewPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import GoalTransferPage from './components/savings/GoalTransferPage';
import MySavingsPage from './components/savings/MySavingsPage';
import OneTapPage from './components/savings/OneTapPage';
import SignUpPage from './components/signup/SignUpPage';
import TransactionsPage from './components/transactions/MainTransactionPage';
import TransactionPage from './components/transactions/TransactionPage';
import UserPage from './components/user/UserPage';
import { useTokenRefresh } from './hooks/useTokenRefresh';

import '@fontsource/varela-round';
import './App.css';
import SubscribePage from './components/subscribe/SubscribePage';

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
      <Route path='privacy-policy' element={<PrivacyPolicyPage />} />
      <Route path='sign-in' element={<SignUpPage />} />
      <Route path='/' element={<LayoutRoute />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<HomePage />} />
          <Route path='onboarding' element={<OnboardingPage />} />
          <Route path='user' element={<UserPage />} />
          <Route path='review' element={<ReviewPage />} />
          <Route path='goals' element={<GoalsPage />} />
          <Route path='subscribe' element={<SubscribePage />} />
          <Route path='log' element={<LogLayoutRoute />}>
            <Route path='savings' element={<MySavingsPage />} />
            <Route path='one-taps' element={<OneTapPage />} />
            <Route path='transactions' element={<TransactionsPage />} />
          </Route>
          <Route path='transactions/:id' element={<TransactionPage />} />
          <Route path='savings/:id' element={<GoalTransferPage />} />
          <Route path='goals/:id' element={<EditGoalPage />} />
        </Route>
      </Route>
    </>
  )
);

function App() {
  useTokenRefresh();
  return <RouterProvider router={router} />;
}

export default App;
