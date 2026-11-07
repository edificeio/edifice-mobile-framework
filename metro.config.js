const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withRozenite } = require('@rozenite/metro');
const { withRozeniteRequireProfiler } = require('@rozenite/require-profiler-plugin/metro');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg', 'cjs'],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
};

// Rozenite: plugins of React Native DevTools (Redux, zustand…). Off by default: `WITH_ROZENITE=true yarn start`
module.exports = withRozenite(mergeConfig(defaultConfig, config), {
  enabled: process.env.WITH_ROZENITE === 'true',
  // Times of the `require` of the modules at startup (Require Profiler)
  enhanceMetroConfig: metroConfig => withRozeniteRequireProfiler(metroConfig),
});
