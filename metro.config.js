const { getDefaultConfig } = require('expo/metro-config');

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

module.exports = config;
