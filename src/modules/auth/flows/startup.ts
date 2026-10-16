import { accountIsLoggable } from '~/modules/auth/model';
import { initAccountsStore } from '~/modules/auth/store/accounts-persistence';
import { useSignInStore } from '~/modules/auth/store/sign-in';
import track from '~/modules/auth/tracking';

import { restoreAccount } from './restore-account';
import { withTracking } from './track';

/**
 * To be called once at app startup.
 * Reads the saved accounts and signs in the one that was connected last time (the only one if there is just one).
 * If that's not possible, the sign-in status tells where the user must land (login screen of the account / platform).
 */
export const restoreAtStartup = async () => {
  const { account, platform } = initAccountsStore();
  if (account && accountIsLoggable(account)) {
    try {
      await withTracking(track.loginRestore, () => restoreAccount(account));
    } catch {
      // Already logged, and `restoreAccount` set the sign-in status.
    }
  } else if (account || platform) {
    useSignInStore.getState().setStatus({
      accountId: account?.user.id,
      platform: account ? (typeof account.platform === 'string' ? account.platform : account.platform.name) : platform!,
      type: 'restore',
    });
  }
};
