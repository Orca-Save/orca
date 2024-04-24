/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: process.env.NODE_ENV === "production",
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // required for @azure/monitor-opentelemetry-exporter to work
      config.resolve.fallback ??= {};
      config.resolve.fallback.os = false;
      config.resolve.fallback.fs = false;
      config.resolve.fallback.child_process = false;
      config.resolve.fallback.path = false;
    }
    return config;
  },
};

export default nextConfig;
