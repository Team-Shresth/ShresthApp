const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable .wasm resolution for expo-sqlite web support
// (expo-sqlite/web/worker.ts imports './wa-sqlite/wa-sqlite.wasm')
config.resolver.assetExts.push('wasm');

// wa-sqlite requires SharedArrayBuffer on web, which needs cross-origin isolation
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    middleware(req, res, next);
  };
};

module.exports = config;
