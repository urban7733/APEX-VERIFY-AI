/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    // Keep optimized for Vercel deployment with API routes
    unoptimized: false,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // DO NOT use static export - we need serverless functions for API routes
  // Vercel will automatically handle the deployment correctly
}

export default nextConfig
