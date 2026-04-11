import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'online.feliubadalo.com',
      },
    ],
  },
};

export default nextConfig;
