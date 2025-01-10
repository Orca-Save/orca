import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';

import ChartPage from './components/charts/ChartPage';
import HomePage from './components/dashboard';
import EditGoalPage from './components/goals/EditGoalPage';
import GoalsPage from './components/goals/MainGoalPage';
import LogNavTabs from './components/log/LogNavTabs';
import AppLayout from './components/nav/AppLayout';
import OnboardingPage from './components/onboarding/OnboardingPage';
import PrivacyPolicyPage from './components/privacy-policy';
import ReviewPage from './components/review/ReviewPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import GoalTransferPage from './components/savings/GoalTransferPage';
import MySavingsPage from './components/savings/MySavingsPage';
import OneTapPage from './components/savings/OneTapPage';
import SignUpPage from './components/signup/SignUpPage';
import SubscribePage from './components/subscribe/SubscribePage';
import TransactionsPage from './components/transactions/MainTransactionPage';
import TransactionPage from './components/transactions/TransactionPage';
import UserPage from './components/user/UserPage';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useTokenRefresh } from './hooks/useTokenRefresh';

import '@fontsource/varela-round';
import './App.css';
import SupportPage from './components/support/SupportPage';
import { Flex } from 'antd';

const LayoutRoute = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

const LogLayoutRoute = () => (
  <Flex vertical style={{ height: '100%' }}>
    <LogNavTabs />
    <div style={{ overflow: 'auto' }}>
      <Outlet />
    </div>
  </Flex>
);
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='privacy-policy' element={<PrivacyPolicyPage />} />
      <Route path='sign-in' element={<SignUpPage />} />
      <Route path='support' element={<SupportPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path='onboarding' element={<OnboardingPage />} />
        <Route path='/' element={<LayoutRoute />}>
          <Route index element={<HomePage />} />
          <Route path='user' element={<UserPage />} />
          <Route path='review' element={<ReviewPage />} />
          <Route path='goals' element={<GoalsPage />} />
          <Route path='subscribe' element={<SubscribePage />} />
          <Route path='charts' element={<ChartPage />} />
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
  usePushNotifications();
  return <RouterProvider router={router} />;
}

export default App;
