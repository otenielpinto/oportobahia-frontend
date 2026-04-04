import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  logging: {
    browserToTerminal: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    qualities: [25, 50, 75, 80, 90, 100],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;