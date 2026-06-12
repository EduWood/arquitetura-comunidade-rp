/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // `serverComponentsExternalPackages` was renamed to `serverExternalPackages` in Next 15
    // See: https://nextjs.org/docs/messages/invalid-next-config
    serverExternalPackages: ["bcryptjs", "nodemailer", "prisma", "@prisma/client"],
  },
}

export default nextConfig
