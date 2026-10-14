import { produce } from 'immer';
import { create } from 'zustand';

import appConf, { Platform } from '~/framework/util/appConf';
import { Error } from '~/framework/util/error';

import { AuthCredentials, AuthSavedAccount } from '../model';
import * as service from '../service/token';

type State = {
  status?: {
    error?: Error.WithKey;
    platform: Platform['name'];
  };
};

type Action = {
  clearError: () => void;
};

export const useSignInStore = create<State & Action>()(set => ({
  clearError: () =>
    set(
      produce((state: State) => {
        if (state.status) state.status.error = undefined;
      }),
    ),
  status: undefined,
}));
