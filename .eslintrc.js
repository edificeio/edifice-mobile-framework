module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'airbnb-typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
    'universe/native',
  ],
  rules: {
    "react/jsx-no-bind": [
      0,
      {
        ignoreDOMComponents: false,
        ignoreRefs: false,
        allowArrowFunctions: true,
        allowFunctions: true,
        allowBind: true,
      },
    ],
  },
};
