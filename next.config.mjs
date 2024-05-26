/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    config.optimization.minimize = false;
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
