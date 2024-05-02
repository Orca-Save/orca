import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter";
import { registerOTel } from "@vercel/otel";

export async function register() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  registerOTel({
    serviceName: "orca",
    traceExporter: new AzureMonitorTraceExporter({
      connectionString: process.env.NEXT_PUBLIC_APP_INSIGHTS_CONNECTION_STRING,
    }),
  });
}
