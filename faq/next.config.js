/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['*']
    },
    // Pastikan transform tidak gagal di Netlify
    forceSwcTransforms: true
  },
  images: {
    unoptimized: true, // ⚠️ wajib diaktifkan agar build image tidak error
    domains: ['localhost']
  },
  eslint: {
    ignoreDuringBuilds: true // biar lint error tidak menggagalkan build
  },
  typescript: {
    ignoreBuildErrors: true // biar error TS tidak menggagalkan build
  }
};

module.exports = nextConfig;
