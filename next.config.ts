import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // pour les avatars GitHub
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.com", // si tu affiches des images depuis github.com (moins courant)
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/auth/callback",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
  output: "standalone",
};

export default nextConfig;
