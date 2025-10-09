/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['*'],
    },
    // hapus "forceSwcTransforms" jika kamu tidak benar-benar butuh (kadang bikin konflik di Next 14/15)
  },

  images: {
    unoptimized: true,
    domains: ['localhost'],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
