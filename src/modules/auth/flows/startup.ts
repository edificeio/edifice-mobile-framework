import { initAccountsStore } from '~/modules/auth/store/accounts-persistence';
import { useSignInStore } from '~/modules/auth/store/sign-in';

import { restoreAccount } from './restore-account';

/**
 * To be called once at app startup.
 * Reads the saved accounts and signs in the one that was connected last time (the only one if there is just one).
 * If that's not possible, the sign-in status tells where the user must land (login screen of the account / platform).
 */
export const restoreAtStartup = async () => {
  const { account, platform } = initAccountsStore();
  if (account) await restoreAccount(account);
  else if (platform) useSignInStore.getState().setStatus({ platform, type: 'restore' });
};
