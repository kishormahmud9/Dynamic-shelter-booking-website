/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker multi-stage build (copies minimal server.js)
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_API_URL
          ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
          : 'yourdomain.com',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
