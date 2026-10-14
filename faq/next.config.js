const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ⚠️⚠️⚠️ WAJIB — INI KUNCI UNTUK FIREBASE-ADMIN ⚠️⚠️⚠️
  serverExternalPackages: ["firebase-admin"],

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: ["*"],
    },
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  webpack: (config, { isServer, webpack }) => {
    config.resolve.alias["@"] = path.resolve(__dirname);

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        net: false,
        tls: false,
      };

      config.plugins.push(
        new webpack.IgnorePlugin({ resourceRegExp: /^firebase-admin$/ })
      );
    }

    // ⚠️ TAMBAHAN: pastikan firebase-admin tidak di-bundle di server
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("firebase-admin");
    }

    return config;
  },
};

module.exports = nextConfig;
