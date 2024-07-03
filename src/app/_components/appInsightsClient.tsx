'use client';
import { ClickAnalyticsPlugin } from '@microsoft/applicationinsights-clickanalytics-js';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { createBrowserHistory } from 'history';
import { useEffect } from 'react';
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
        connectionString:
          process.env.NEXT_PUBLIC_APP_INSIGHTS_CONNECTION_STRING,
        extensions: [reactPlugin, clickPluginInstance],
        namePrefix: 'local-web',
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
const logMessageToAppInsights = (message: string) => {
  if (appInsights) {
    appInsights.trackTrace({ message });
  }
};
const AppInsightService: React.FC = () => {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      !appInsights &&
      process.env.NODE_ENV === 'production'
    ) {
      initializeAppInsights();
    }
  }, []);
  useEffect(() => {
    logMessageToAppInsights('AppInsightService component mounted');
  }, []);

  return null;
};
export { AppInsightService, reactPlugin };
