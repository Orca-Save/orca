export async function register() {
  // if (process.env.NODE_ENV !== 'production') {
  //   return;
  // }
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./appInsights');
  }
  // registerOTel({
  //   serviceName: 'orca-local',
  //   traceExporter: new AzureMonitorTraceExporter({
  //     connectionString: process.env.NEXT_PUBLIC_APP_INSIGHTS_CONNECTION_STRING,
  //   }),
  // });
}
