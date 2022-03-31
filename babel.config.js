module.exports = function (api) {
  if (api.env('production')) {
    return {
      presets: ['module:metro-react-native-babel-preset'],
      plugins: ['transform-remove-console'],
    };
  }

  return {
    presets: ['module:metro-react-native-babel-preset'],
  };
};
