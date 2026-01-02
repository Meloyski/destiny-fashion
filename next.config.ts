import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow ngrok origin for local dev when Bungie needs a public URL
  allowedDevOrigins: [
    "https://on-pheasant-seriously.ngrok-free.app",
    "http://on-pheasant-seriously.ngrok-free.app",
  ],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  experimental: {
    turbo: false,
  },
};

export default nextConfig;
