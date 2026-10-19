/**
 * Accounts as the auth module has them, for the tests: only what the code under test reads is meaningful, the rest is plausible
 * filler. Each function takes the fields a test cares about, and gives a new object each time.
 */

import type { Platform } from '~/framework/util/appConf';
import {
  AccountType,
  type AuthActiveAccount,
  type AuthRequirement,
  type AuthSavedAccount,
  type AuthTokenSet,
  InitialAuthenticationMethod,
  SessionPersistence,
} from '~/modules/auth/model';

export const createTokens = (overrides: Partial<AuthTokenSet> = {}): AuthTokenSet => ({
  access: { expiresAt: '2100-01-01T00:00:00.000Z', type: 'Bearer', value: 'access' },
  origin: 'https://platform.test',
  refresh: { value: 'refresh' },
  scope: ['scope'],
  ...overrides,
});

interface ActiveAccountOptions {
  id?: string;
  type?: AccountType;
  requirement?: AuthRequirement;
  addTimestamp?: number;
  logTimestamp?: number;
  tokens?: Partial<AuthTokenSet>;
}

/** An account that is signed in (what a sign-in gives): it has a profile, rights and tokens. */
export const createActiveAccount = ({
  addTimestamp = 1000,
  id = 'acc1',
  logTimestamp = 1000,
  requirement,
  tokens,
  type = AccountType.Teacher,
}: ActiveAccountOptions = {}) =>
  ({
    addTimestamp,
    logTimestamp,
    method: InitialAuthenticationMethod.LOGIN_PASSWORD,
    persist: SessionPersistence.PERMANENT,
    platform: { name: 'platform', url: 'https://platform.test' } as Platform,
    requirement,
    rights: { apps: [], authorizedActions: [], widgets: [] },
    tokens: createTokens(tokens),
    user: { displayName: `Name ${id}`, firstName: 'First', id, lastName: 'Last', loginUsed: `login-${id}`, type },
  }) as unknown as AuthActiveAccount;

interface SavedAccountOptions {
  id?: string;
  type?: AccountType;
  addTimestamp?: number;
  /** Whether the saved account still has tokens (it was put to sleep), or not (it was logged out). Defaults to `true`. */
  loggedIn?: boolean;
}

/** An account as it is saved on the device. */
export const createSavedAccount = ({
  addTimestamp = 1000,
  id = 'acc1',
  loggedIn = true,
  type = AccountType.Teacher,
}: SavedAccountOptions = {}) =>
  ({
    addTimestamp,
    method: InitialAuthenticationMethod.LOGIN_PASSWORD,
    platform: 'platform',
    ...(loggedIn ? { logTimestamp: addTimestamp, tokens: createTokens() } : undefined),
    user: { displayName: `Name ${id}`, id, loginUsed: `login-${id}`, type },
  }) as unknown as AuthSavedAccount;
