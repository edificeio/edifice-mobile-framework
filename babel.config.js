module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Must run before anything else touches the import
    ['babel-plugin-inline-import', { extensions: ['.rawjs'] }],
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