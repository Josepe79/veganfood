import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.railway.app',
      },
      {
        protocol: 'https',
        hostname: 'veganfood.es',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      }
    ],
  },
};

export default nextConfig;
