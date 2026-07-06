// eslint.config.js
const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');

const reactNativeConfig = require('@react-native/eslint-config/flat');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const globals = require('globals');

const pluginImport = require('eslint-plugin-import');
const pluginNoInlineStyles = require('eslint-plugin-no-inline-styles');
const pluginPrettier = require('eslint-plugin-prettier');
const pluginSortDestructureKeys = require('eslint-plugin-sort-destructure-keys');
const pluginSortKeysFix = require('eslint-plugin-sort-keys-fix');

// Strip @typescript-eslint from the base config (index 5) so we can own
// that registration exclusively in our main config object below.
const fixedRNConfig = fixupConfigRules(reactNativeConfig).map(config => {
  if (config.plugins?.['@typescript-eslint']) {
    const { '@typescript-eslint': _removed, ...remainingPlugins } = config.plugins;
    return { ...config, plugins: remainingPlugins };
  }
  return config;
});

module.exports = [
  // ── Ignores (replaces eslintIgnore in package.json) ──────────────────
  {
    ignores: [
      'eslint.config.js',
      '.eslintrc.js',
      '__tests__/**',
      '__overrides__/**',
      '__stashSpec__/**',
      'cli/**',
      'gen/**',
      'lib/**',
      'node_modules/**',
      'scaffolder/**',
      'src/app/override/**',
    ],
  },
  // ── React Native base (includes RN, React, TS-eslint, prettier-compat) ─
  ...fixedRNConfig,
  // ── Main config for all source files ─────────────────────────────────
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        __DEV__: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import': fixupPluginRules(pluginImport),
      'no-inline-styles': fixupPluginRules(pluginNoInlineStyles),
      'prettier': pluginPrettier,
      'sort-destructure-keys': pluginSortDestructureKeys,
      'sort-keys-fix': fixupPluginRules(pluginSortKeysFix),
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // ── TypeScript ──────────────────────────────────────────────────
      '@typescript-eslint/no-shadow': 'error',
      'no-shadow': 'off',
      'no-undef': 'off',
      // ── React ───────────────────────────────────────────────────────
      'react/no-unstable-nested-components': 'off',
      // ── React Hooks ─────────────────────────────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // ── React Native ────────────────────────────────────────────────
      'react-native/no-raw-text': ['error', {
        skip: [
          'HeadingXLText', 'HeadingLText', 'HeadingMText', 'HeadingSText',
          'HeadingXSText', 'HeadingXXSText', 'BodyText', 'BodyBoldText',
          'BodyItalicText', 'BodyBoldItalicText', 'SmallText', 'SmallBoldText',
          'SmallItalicText', 'SmallBoldItalicText', 'CaptionText',
          'CaptionBoldText', 'CaptionItalicText', 'CaptionBoldItalicText',
          'SmallInverseText', 'SmallActionText', 'NestedText', 'NestedBoldText',
          'NestedItalicText', 'NestedActionText',
        ],
      }],
      // ── No inline styles ────────────────────────────────────────────
      'no-inline-styles/no-inline-styles': 'error',
      // ── Imports ─────────────────────────────────────────────────────
      'import/newline-after-import': ['warn', { count: 1 }],
      'import/no-duplicates': 'error',
      'import/order': ['error', {
        alphabetize: { caseInsensitive: true, order: 'asc' },
        groups: [['external', 'builtin'], 'internal', ['sibling', 'parent'], 'index'],
        'newlines-between': 'always',
        pathGroups: [
          { group: 'external', pattern: '@(react|react-native)', position: 'before' },
          { group: 'internal', pattern: '@miBoilerplate/**' },
          { group: 'internal', pattern: '@src/**' },
        ],
        pathGroupsExcludedImportTypes: ['internal', 'react'],
      }],
      // ── Sorting ─────────────────────────────────────────────────────
      'sort-imports': ['error', {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      }],
      'sort-destructure-keys/sort-destructure-keys': ['error', { caseSensitive: false }],
      'sort-keys-fix/sort-keys-fix': ['error', 'asc', { caseSensitive: false, natural: true }],
      // ── Console ─────────────────────────────────────────────────────
      'no-console': ['error', { allow: ['debug', 'error', 'info', 'warn'] }],
      // ── Restricted imports ──────────────────────────────────────────
      'no-restricted-imports': ['error', {
        importNames: ['Text', 'Image'],
        message: 'Please use @app/blueprints for importing main elements.',
        name: 'react-native',
      }],
      // ── Prettier ────────────────────────────────────────────────────
      'prettier/prettier': ['error', {
        arrowParens: 'avoid',
        bracketSpacing: true,
        importOrder: ['^[~/]', '^[./]'],
        importOrderSeparation: true,
        importOrderSortSpecifiers: true,
        jsxBracketSameLine: true,
        printWidth: 132,
        quoteProps: 'consistent',
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'all',
      }],
    },
  },
  // ── Jest — only for test files ────────────────────────────────────────
  {
    files: ['**/__tests__/**/*.{js,ts,tsx}', '**/*.{spec,test}.{js,ts,tsx}'],
    rules: {
      'jest/expect-expect': 'warn',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/valid-expect': 'error',
    },
  },
];
