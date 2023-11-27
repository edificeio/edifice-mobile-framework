module.exports = function (api) {
  if (api.env('production')) {
    return {
      presets: ['module:metro-react-native-babel-preset'],
      plugins: [
        '@babel/plugin-transform-flow-strip-types',
        'transform-remove-console',
        'react-native-reanimated/plugin',
        ['@babel/plugin-transform-private-methods', { loose: true }],
      ],
    };
  }

  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      '@babel/plugin-transform-flow-strip-types',
      'react-native-reanimated/plugin',
      ['@babel/plugin-transform-private-methods', { loose: true }],
    ],
  };
};
