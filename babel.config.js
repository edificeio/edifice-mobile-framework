module.exports = function (api) {
  if (api.env('production')) {
    return {
      presets: ['module:metro-react-native-babel-preset'],
      plugins: ['transform-remove-console', 'react-native-reanimated/plugin'],
    };
  }

  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
