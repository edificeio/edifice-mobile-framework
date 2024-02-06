module.exports = function (api) {
  if (api.env('production')) {
    return {
      presets: ['module:@react-native/babel-preset'],
      plugins: [
        'transform-remove-console',
        'react-native-reanimated/plugin',
        '@babel/plugin-transform-flow-strip-types',
        ['@babel/plugin-transform-private-methods', { loose: true }],
      ],
    };
  }

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-flow-strip-types',
      ['@babel/plugin-transform-private-methods', { loose: true }],
    ],
  };
};
