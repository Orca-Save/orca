const appInsights = require('applicationinsights');
if (process.env.NODE_ENV === 'production') {
  appInsights
    .setup(process.env.NEXT_PUBLIC_APP_INSIGHTS_CONNECTION_STRING)
    .setAutoCollectConsole(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectRequests(true)
    .setAutoDependencyCorrelation(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .setSendLiveMetrics(true)
    .setUseDiskRetryCaching(true)
    .enableWebInstrumentation(true);
  appInsights.serviceName = process.env.INSIGHTS_NAME;
  appInsights.start();
}
export default appInsights;
const appInsightsClient = appInsights.defaultClient;
export { appInsightsClient };
