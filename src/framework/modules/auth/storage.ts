import {
  accountIsLoggable,
  AuthActiveAccount,
  AuthSavedAccount,
  AuthSavedLoggedInAccount,
  getSerializedLoggedInAccountInfo,
} from './model';
import moduleConfig from './module-config';
import { ERASE_ALL_ACCOUNTS, IAuthState } from './reducer';

import appConf from '~/framework/util/appConf';
import { Storage } from '~/framework/util/storage';

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
  'show-onboarding': boolean;
}

export const storage = Storage.slice<AuthStorageData>().withModule(moduleConfig);
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
  );
};
export const readSavedStartup = () => {
  let startup = storage.getJSON('startup');
  const oldCurrentPlatform = Storage.global.getString('currentPlatform'); // pre-1.12 storage
  if (!startup?.platform && oldCurrentPlatform) startup = { platform: oldCurrentPlatform };
  const oldCurrentToken = Storage.global.getString('token'); // pre-1.12 storage
  if (!startup?.account && oldCurrentToken) startup = { ...startup, anonymousToken: JSON.parse(oldCurrentToken) };
  return { ...startup } as AuthStorageData['startup'];
};
export const readShowOnbording = () => storage.getBoolean('show-onboarding') ?? true;

/**
 * Save in storage a new account along the pre-exising ones.
 * @param account
 * @param showOnboarding
 */
export const writeCreateAccount = (account: AuthActiveAccount, showOnboarding: boolean = false) => {
  const savedAccount = getSerializedLoggedInAccountInfo(account);
  const savedAccounts: Record<string, AuthSavedAccount> = {
    ...readSavedAccounts(),
    [account.user.id]: savedAccount,
  };
  const startup: AuthStorageData['startup'] = {
    account: account.user.id,
    platform: account.platform.name,
  };
  storage.setJSON('accounts', savedAccounts);
  storage.setJSON('startup', startup);
  storage.set('show-onboarding', showOnboarding);
};

/**
 * Save in storage an account replacing the one with given id.
 * @param account
 * @param showOnboarding
 */
export const writeReplaceAccount = (
  id: string | typeof ERASE_ALL_ACCOUNTS,
  account: AuthActiveAccount,
  showOnboarding: boolean = false,
) => {
  const savedAccount = getSerializedLoggedInAccountInfo(account);
  const savedAccounts = id === ERASE_ALL_ACCOUNTS ? {} : readSavedAccounts();
  if (id !== ERASE_ALL_ACCOUNTS) delete savedAccounts[id];
  savedAccounts[account.user.id] = savedAccount;
  const startup: AuthStorageData['startup'] = {
    account: account.user.id,
    platform: account.platform.name,
  };
  storage.setJSON('accounts', savedAccounts);
  storage.setJSON('startup', startup);
  storage.set('show-onboarding', showOnboarding);
};
/**
 * Update the given account information in the storage
 * @param account
 */
export const writeUpdateAccount = (savedAccount: AuthSavedAccount) => {
  const savedAccounts = readSavedAccounts();
  savedAccounts[savedAccount.user.id] = savedAccount;
  storage.setJSON('accounts', savedAccounts);
};

export const writeRemoveToken = (account: AuthActiveAccount | AuthSavedLoggedInAccount) => {
  const accounts = storage.getJSON('accounts');
  if (accounts) {
    const savedAccount = accounts[account.user.id];
    if (savedAccount) {
      (savedAccount as Partial<AuthSavedLoggedInAccount>).tokens = undefined;
      accounts[account.user.id] = savedAccount;
    }
    storage.setJSON('accounts', accounts);
  }
};

export const writeLogout = (account: AuthActiveAccount) => {
  // Remove token for loegged out account
  writeRemoveToken(account);
  // Remove account id in startup object
  storage.delete('startup');
};

/**
 * Delete the given account information in the storage
 * @param account
 */
export const writeDeleteAccount = (id: keyof IAuthState['accounts']) => {
  const savedAccounts = readSavedAccounts();
  delete savedAccounts[id];
  storage.setJSON('accounts', savedAccounts);
  Storage.erasePreferences(id);
};
