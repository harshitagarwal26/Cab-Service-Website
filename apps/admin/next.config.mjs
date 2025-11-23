/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Transpile the local DB package so Next.js can see the Prisma dependency
  transpilePackages: ['@cab/db'], 

  // 2. Enable standalone output to improve file tracing on Vercel
  output: 'standalone',

  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
    // 3. Prevent bundling of native binaries
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  
  // 4. Explicitly ignore the browser mapping warning for Prisma
  webpack: (config) => {
    config.externals = [...(config.externals || []), '@prisma/client', 'bcryptjs'];
    return config;
  },
};

export default nextConfig;