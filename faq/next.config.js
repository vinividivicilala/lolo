const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: ["*"],
    },
  },

  images: {
    unoptimized: true,
    domains: ["localhost"],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config, { isServer }) => {
    // Alias untuk @
    config.resolve.alias["@"] = path.resolve(__dirname);
    
    // Fallback untuk crypto di browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
