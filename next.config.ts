import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {},
  },

  swcMinify: true,
  productionBrowserSourceMaps: false,

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
