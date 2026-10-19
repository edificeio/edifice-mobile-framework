/**
 * Globals the code expects, set before any test file runs (see `setupFiles` of `jest.config.js`).
 */

const globals = globalThis as { __DEV__?: boolean; IS_REACT_ACT_ENVIRONMENT?: boolean };

// React Native's own global
globals.__DEV__ = true;

// Tells React that state updates in tests are wrapped in `act` (see `src/test-utils/render-hook.tsx`)
globals.IS_REACT_ACT_ENVIRONMENT = true;
