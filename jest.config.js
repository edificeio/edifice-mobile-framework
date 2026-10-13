/**
 * Jest configuration.
 *
 * Tests sit next to the code they test, in `*.test.ts` / `*.test.tsx` files under `src/`.
 * They run in plain Node (no React Native runtime): they test logic, not native modules or screens. Whatever a test needs from the
 * native side is replaced by a fake:
 * - a package that can't run in Node (`react-native-mmkv`...) is replaced everywhere by a file of `jest/mocks/`, named like the package
 *   and listed in `moduleNameMapper` below: nothing to do in the tests;
 * - a module of the app that depends on the native side is replaced test by test, with `jest.mock('path')` and a `__mocks__/` folder
 *   next to it;
 * - fakes and helpers that several tests share are in `src/test-utils/`.
 * The code is transformed with the Babel config of the app, and the `~` alias is the one of `tsconfig.json`.
 */
module.exports = {
  // Spies and mocks start clean in each test, and the spies of a test never leak into the next one
  clearMocks: true,
  restoreMocks: true,
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    // Packages replaced by a fake: one line each, the file has the name of the package (see above)
    '^react-native-mmkv$': '<rootDir>/jest/mocks/react-native-mmkv.ts',
    '^@react-navigation/native$': '<rootDir>/jest/mocks/@react-navigation/native.ts',
  },
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/jest/setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest/setup-after-env.ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  // The mock of MMKV that `react-native-mmkv` provides for tests is in ES modules, like the packages in this list: they are transformed
  transformIgnorePatterns: ['/node_modules/(?!react-native-mmkv/)'],
};
