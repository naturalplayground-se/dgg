module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: require.resolve("buffer"),
      };
    }
    return config;
  },
  poweredByHeader: false,
  generateEtags: false,
};
