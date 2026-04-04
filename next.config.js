/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    browserToTerminal: true,
  },
  images: {
    qualities: [75, 80, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
