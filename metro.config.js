const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts
    .filter(ext => ext !== 'svg')
    .concat(['sql']),
  sourceExts: config.resolver.sourceExts
    .filter(ext => ext !== 'sql')
    .concat(['svg']),
};

module.exports = config;
