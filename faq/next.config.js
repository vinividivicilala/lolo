/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,  // Enable the experimental appDir feature
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig;
