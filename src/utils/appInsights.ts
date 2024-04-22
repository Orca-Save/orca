import appInsights from "applicationinsights";
console.log("appInsights");
export const appInsightsConfig = appInsights
  .setup(
    "InstrumentationKey=706275da-9b2f-4103-bcd4-b46fc818f4c1;IngestionEndpoint=https://westus2-2.in.applicationinsights.azure.com/;LiveEndpoint=https://westus2.livediagnostics.monitor.azure.com/;ApplicationId=9a80d1da-f8fb-4bab-92ea-96cd7f022931"
  )
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setAutoCollectPreAggregatedMetrics(true)
  .setSendLiveMetrics(true)
  .setInternalLogging(true, true)
  .enableWebInstrumentation(true)
  .start();
