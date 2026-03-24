module.exports = function (api) {
  if (api.env('production')) {
    return {
      plugins: [
        //'transform-remove-console',
        '@babel/plugin-transform-flow-strip-types',
        ['@babel/plugin-transform-private-methods', { loose: true }],
        'react-native-worklets/plugin',
      ],
      presets: ['module:@react-native/babel-preset'],
    };
  }

  return {
    plugins: [
      '@babel/plugin-transform-flow-strip-types',
      ['@babel/plugin-transform-private-methods', { loose: true }],
      'react-native-worklets/plugin',
    ],
    presets: ['module:@react-native/babel-preset'],
  };
};
