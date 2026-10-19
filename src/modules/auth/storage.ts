/**
 * Auth storage (MMKV)
 *
 * Storage format is the same as before the zustand migration : no data migration is needed.
 * Reading/writing is only done by `store/accounts-persistence.ts`.
 */

import appConf from '~/framework/util/appConf';
import { Storage } from '~/framework/util/storage';

import { accountIsLoggable, AuthSavedAccount } from './model';

export const STORAGE_PREFIX = 'auth';

export interface Pre_1_12_OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
  refresh_token: string;
  scope: string;
}

export interface AuthStorageData {
  'accounts': Record<string, AuthSavedAccount>;
  'startup': {
    account?: string;
    platform?: string;
    /** used to migrate pre-1.12 automatic connections */
    anonymousToken?: Pre_1_12_OAuthToken;
  };
  /** Tells if the welcome screen must be shown. True until the user signed in for the first time (then false for ever). */
  'show-onboarding': boolean;
}

export const storage = Storage.device<AuthStorageData>({ namespace: STORAGE_PREFIX });
// No storage init for auth, the functions below manage the item migration by custom logic.

export const readSavedAccounts = () => {
  const raw = storage.getJSON('accounts');
  if (!raw) return {};

  // Need to populate origin for tokens generated before v1.16.3
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => {
      if (accountIsLoggable(value)) {
        return [
          key,
          {
            ...value,
            tokens: { ...value.tokens, origin: value.tokens.origin ?? appConf.getExpandedPlatform(value.platform)?.url },
          },
        ];
      }
      return [key, value];
    }),
  ) as Record<string, AuthSavedAccount>;
};

export const readSavedStartup = () => {
  let startup = storage.getJSON('startup');
  const oldCurrentPlatform = Storage.global.getString('currentPlatform'); // pre-1.12 storage
  if (!startup?.platform && oldCurrentPlatform) startup = { platform: oldCurrentPlatform };
  const oldCurrentToken = Storage.global.getString('token'); // pre-1.12 storage
  if (!startup?.account && oldCurrentToken) startup = { ...startup, anonymousToken: JSON.parse(oldCurrentToken) };
  return { ...startup } as AuthStorageData['startup'];
};

/** Defaults to true: the welcome screen is shown at the first launch of the app. */
export const readShowWelcome = () => storage.getBoolean('show-onboarding') ?? true;

export const writeShowWelcome = (showWelcome: boolean) => {
  storage.set('show-onboarding', showWelcome);
};

export const writeAccounts = (accounts: Record<string, AuthSavedAccount>) => {
  storage.setJSON('accounts', accounts);
};

/**
 * @param startup the account to restore at next app launch. Removes the item if undefined.
 */
export const writeStartup = (startup: AuthStorageData['startup'] | undefined) => {
  if (startup) storage.setJSON('startup', startup);
  else storage.remove('startup');
};

/**
 * Erase every preference (per-account storage) of the given account id.
 */
export const eraseStorageForAccount = (id: string) => {
  Storage.eraseForAccount(id);
};
