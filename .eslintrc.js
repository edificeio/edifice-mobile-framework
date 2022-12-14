module.exports = {
  root: true,
  env: {
    browser: true,
    'react-native/react-native': true,
  },
  extends: ['@react-native-community', 'airbnb-typescript', 'eslint:recommended', 'prettier', 'universe/native'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'prettier', 'import', 'react', 'react-hooks', 'react-native', 'jest'],
  rules: {
    '@typescript-eslint/naming-convention': ['error'],
    'ft-flow/boolean-style': [2, 'boolean'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'react/jsx-no-bind': [
      0,
      {
        ignoreDOMComponents: false,
        ignoreRefs: false,
        allowArrowFunctions: true,
        allowFunctions: true,
        allowBind: true,
      },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-unused-styles': 2,
    'react-native/split-platform-components': 2,
    'react-native/no-inline-styles': 2,
    'react-native/no-color-literals': 2,
    // 'react-native/no-raw-text': 2,
    'react-native/no-single-element-style-arrays': 2,
  },
  settings: {
    'ft-flow': {
      onlyFilesWithFlowAnnotation: false,
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        directory: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'import/ignore': ['react-native'],
  },
};
