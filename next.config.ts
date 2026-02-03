import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
  // Disable build cache in development to prevent persistent errors
  experimental: {
    // Disable build worker to prevent cache issues
    webpackBuildWorker: false,
  },
  // Ensure clean builds
  cleanDistDir: true,
  // Disable static optimization for API routes to prevent caching issues
  generateBuildId: async () => {
    // Generate unique build ID to prevent cache reuse
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
