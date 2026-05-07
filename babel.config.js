module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Decorators MUST come first
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    // Flow stripping
    '@babel/plugin-transform-flow-strip-types',
    // Worklets last
    'react-native-worklets/plugin',
  ],
  assumptions: {
    setPublicClassFields: true,
    privateFieldsAsProperties: true,
  },
};