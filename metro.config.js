const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts = Array.from(new Set([...config.resolver.assetExts, 'wasm', 'sql']));
config.resolver.sourceExts = config.resolver.sourceExts.filter((extension) => extension !== 'wasm' && extension !== 'sql');
module.exports = config;
