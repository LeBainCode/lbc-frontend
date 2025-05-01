import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["github.com", "avatars.githubusercontent.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        // This handles redirects from GitHub OAuth
        source: "/auth/callback",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
  // Make sure the dashboard page is included in the build
  output: "standalone",
};

export default nextConfig;
