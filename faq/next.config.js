/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // ✅ penting untuk Netlify
  images: {
    domains: ['localhost'], // tetap bisa load gambar lokal
  },

  webpack: (config, { isServer }) => {
    // 🚫 Nonaktifkan modul Node.js di client-side
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
