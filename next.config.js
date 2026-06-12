/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip API routes data collection during build
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Build configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Ignore Prisma warnings
  serverComponentsExternalPackages: ['@prisma/client'],
};

module.exports = nextConfig;

