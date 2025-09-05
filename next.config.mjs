/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,

  // Webpack configuration to fix build issues and Windows path regex errors
  webpack: (config, { isServer, dev }) => {
    // Fix Windows path handling - use string patterns only to avoid webpack schema issues
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
        '**/.git/**',
        // Windows system directories - use glob patterns
        '**/Application Data/**',
        '**/AppData/**',
        '**/Cookies/**',
        '**/Local Settings/**',
        '**/My Documents/**',
        '**/Recent/**',
        '**/System Volume Information/**',
        '**/$RECYCLE.BIN/**',
        // Additional Windows-specific patterns
        '**/Temporary Internet Files/**',
        '**/History/**',
        '**/Favorites/**'
      ],
      // Reduce file system polling on Windows
      poll: dev ? 1000 : false
    };

    // Additional webpack configuration to prevent permission issues
    config.cache = false;
    config.infrastructureLogging = { level: "error" };

    // Add module resolution fixes
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    };

    return config;
  },

  // Experimental features to improve build stability
  experimental: {
    webpackMemoryOptimizations: true,
  },

  // Output configuration
  output: "standalone",

  // Disable source maps in production to reduce build time
  productionBrowserSourceMaps: false,
};

export default nextConfig;
