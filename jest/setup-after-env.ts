/**
 * Runs before each test file, once the test framework is ready (see `setupFilesAfterEnv` of `jest.config.js`).
 */

// The debug logs of the code only make the output of the tests unreadable. Tests that want to check a log spy on it themselves.
beforeEach(() => {
  jest.spyOn(console, 'debug').mockImplementation(() => {});
});
