import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../../client/src/utils/appInsightsClient';
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
