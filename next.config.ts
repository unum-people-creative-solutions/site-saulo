import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: process.env.NEXT_PUBLIC_E2E === '1' ? false : undefined,
};

export default nextConfig;
