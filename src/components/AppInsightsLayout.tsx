'use client';
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../app/_components/appInsightsClient';
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {process.env.NODE_ENV === 'production' ? (
        <AppInsightsContext.Provider value={reactPlugin}>
          {children}
        </AppInsightsContext.Provider>
      ) : (
        children
      )}
    </>
  );
};
export default Layout;
