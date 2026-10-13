/**
 * Replaces the package `@react-navigation/native` in every test (see `moduleNameMapper` of `jest.config.js`).
 * React Navigation does not provide mocks of its own: this one only gives what the code under test imports at run time.
 * Add what a test needs when it needs it, and give it a behavior in the test (`jest.mocked(useNavigation).mockReturnValue(...)`).
 */

export const useNavigation = jest.fn();
