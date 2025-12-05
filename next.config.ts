import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Trigger restart for prisma schema update 2
};

export default nextConfig;
