import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {},
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
