import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter";
import { registerOTel } from "@vercel/otel";

export async function register() {
  registerOTel({
    serviceName: "your-project-name",
    traceExporter: new AzureMonitorTraceExporter({
      connectionString: process.env.APP_INSIGHTS_CONNECTION_STRING,
      // you can read from ENV if you prefer to
      // connectionString: process.env.APP_INSIGHTS_CONNECTION_STRING,
    }),
  });
}
