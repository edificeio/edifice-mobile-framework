import { produce } from 'immer';
import { create } from 'zustand';

import { Platform } from '~/framework/util/appConf';
import { Error } from '~/framework/util/error';

/**
 * Where the user stands in the sign-in process, which decides the screen to show first.
 * Undefined status means there is no specific situation: the user starts from the welcome screen.
 */
export type SignInStatus =
  /** The user must come back to the login screen of a platform (restore failed, login cancelled, logout...) */
  | {
      type: 'restore';
      platform: Platform['name'];
      /** If it concerns a saved account, which one */
      accountId?: string;
      /** Login to display if no account is provided */
      loginUsed?: string;
    }
  /** The user entered an activation code instead of its password */
  | { type: 'activation'; platform: Platform['name']; loginUsed: string; code: string; accountId?: string }
  /** The user entered a password renew code instead of its password */
  | { type: 'passwordRenew'; platform: Platform['name']; loginUsed: string; code: string; accountId?: string };

type State = {
  /**
   * Counter of the `setStatus` calls. It tells that the sign-in situation was set again, even to the same status
   * (e.g. a second failed restore of the same account), so the navigation can be reset again.
   */
  attempt: number;
  /** Error of the last sign-in attempt. It is displayed on the screen which `key` matches, or on the first visible one if `key` is undefined. */
  error?: Error.WithKey;
  status?: SignInStatus;
};

type Action = {
  clearError: () => void;
  /** Marks the error as displayed by the screen of given key (used for errors with undefined key, as the ones of a restore). */
  consumeError: (key: number) => void;
  /** Sets the error and links it to the screen it occurred on (`error.key`). */
  setError: (error: Error.WithKey) => void;
  /** Sets the status (and clears the error). Always makes the navigator go to the screen of this status, even if it is the same as before. */
  setStatus: (status: SignInStatus) => void;
  /** Back to the neutral situation: no status, no error. */
  reset: () => void;
};

export const useSignInStore = create<State & Action>()(set => ({
  attempt: 0,
  clearError: () =>
    set(
      produce((state: State) => {
        state.error = undefined;
      }),
    ),
  consumeError: key =>
    set(
      produce((state: State) => {
        if (state.error && state.error.key === undefined) state.error.key = key;
      }),
    ),
  error: undefined,
  reset: () => set({ error: undefined, status: undefined }),
  setError: error =>
    set(
      produce((state: State) => {
        state.error = error;
      }),
    ),
  setStatus: status => set(state => ({ attempt: state.attempt + 1, error: undefined, status })),
  status: undefined,
}));
