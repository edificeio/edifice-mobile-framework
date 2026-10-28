import { runAccountStorageMigrations } from '~/framework/util/storage/migrations';
import { useSignInStore } from '~/modules/auth/sign-in/store';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import { initAccountsStore } from '~/modules/auth/store/accounts-persistence';

import type { createRestoreAccount } from './restore-account';

/**
 * To be called once at app startup.
 * Reads the saved accounts and signs in the one that was connected last time (the only one if there is just one).
 * If that's not possible, the sign-in status tells where the user must land (login screen of the account / platform).
 */
export const createRestoreAtStartup = (restoreAccount: ReturnType<typeof createRestoreAccount>) => async () => {
  const { account, platform } = initAccountsStore();
  // The preferences of every saved account are migrated before anything can read them
  for (const id of Object.keys(useAccountsStore.getState().accounts)) await runAccountStorageMigrations(id);
  if (account) await restoreAccount(account);
  else if (platform) useSignInStore.getState().setStatus({ platform, type: 'login' });
};
