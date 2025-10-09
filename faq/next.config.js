/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // ✅ penting untuk Netlify agar tidak generate HTML statis
  images: {
    domains: ['localhost'], // domain lokal tetap dipertahankan
  },
};

module.exports = nextConfig;
