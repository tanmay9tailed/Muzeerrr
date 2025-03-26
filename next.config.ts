import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com"], 
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
};


export default nextConfig;