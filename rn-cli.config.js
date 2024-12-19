const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = {
  getSourceExts() {
    return ['ts', 'tsx'];
  },
  getTransformModulePath() {
    return require.resolve('react-native-typescript-transformer');
  },
};
