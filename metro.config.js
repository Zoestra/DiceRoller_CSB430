const { getDefaultConfig } = require('expo/metro-config');
<<<<<<< HEAD

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  svgo: false,
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts
    .filter(ext => ext !== 'svg')
    .concat(['wasm', 'sql']),
  sourceExts: config.resolver.sourceExts
    .filter(ext => ext !== 'wasm' && ext !== 'sql')
    .concat(['svg']),
};

=======
const config = getDefaultConfig(__dirname);
config.resolver.assetExts = Array.from(new Set([...config.resolver.assetExts, 'wasm', 'sql']));
config.resolver.sourceExts = config.resolver.sourceExts.filter((extension) => extension !== 'wasm' && extension !== 'sql');
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
module.exports = config;
