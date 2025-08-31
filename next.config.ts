import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['jsonwebtoken'],
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  }
};

export default nextConfig;
