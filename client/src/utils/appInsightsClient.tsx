import { ClickAnalyticsPlugin } from '@microsoft/applicationinsights-clickanalytics-js';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { createBrowserHistory } from 'history';

const reactPlugin = new ReactPlugin();
let appInsights: ApplicationInsights | undefined;
var clickPluginInstance = new ClickAnalyticsPlugin();
var clickPluginConfig = {
  autoCapture: true,
};
const initializeAppInsights = () => {
  if (typeof window !== 'undefined') {
    const customHistory = createBrowserHistory();
    appInsights = new ApplicationInsights({
      config: {
        connectionString: process.env.REACT_APP_INSIGHTS_CONNECTION_STRING,
        extensions: [reactPlugin, clickPluginInstance],
        namePrefix: process.env.REACT_APP_INSIGHTS_NAME,
        extensionConfig: {
          [reactPlugin.identifier]: {
            history: customHistory,
          },
          [clickPluginInstance.identifier]: clickPluginConfig,
        },
        enableAutoRouteTracking: true,
        disableTelemetry: false,
      },
    });

    appInsights.loadAppInsights();
  }
};

if (process.env.NODE_ENV === 'production') initializeAppInsights();

export { reactPlugin };
