/**
 * What holds data that belongs to a session: it is emptied when the session ends, so nothing of an account remains for the next one.
 * `createSessionStore` is the zustand counterpart of `createSessionReducer`; what is not migrated yet registers its own reset with
 * `registerSessionReset` (see `flows/legacy-redux.ts`).
 */

import { create, type StateCreator } from 'zustand';

const sessionResets = new Set<() => void>();

/** Registers what must be emptied when a session ends. */
export const registerSessionReset = (reset: () => void) => {
  sessionResets.add(reset);
};

/** Same as zustand `create`, but the store goes back to its initial state at the end of every session. */
export const createSessionStore = <T>(initializer: StateCreator<T, [], []>) => {
  const useStore = create<T>()(initializer);
  registerSessionReset(() => useStore.setState(useStore.getInitialState(), true));
  return useStore;
};

/** Empties everything that belongs to the session. Called by the framework when a session ends. */
export const resetSessionStores = () => {
  for (const reset of sessionResets) {
    try {
      reset();
    } catch (e) {
      // A reset that fails must not prevent the session from ending, nor the other resets
      console.warn('[Auth] A session reset failed:', e);
    }
  }
};
