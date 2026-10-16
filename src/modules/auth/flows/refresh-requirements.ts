import service from '~/modules/auth/service';
import { assertActiveAccount } from '~/modules/auth/store/accounts';

import { setAccount } from './set-account';

/**
 * Checks again the requirement of the connected account (and updates its user data).
 * - If there still is one, the session is updated with it (only one at a time: the first the platform tells).
 * - If there is none left, the session starts, and the user goes into the app.
 * A refresh is not a sign-in: the account keeps its timestamps.
 * @throws if there is no connected account.
 */
export const refreshRequirements = async () => {
  const account = assertActiveAccount();
  const { session, ...result } = await service.signIn.refresh(account);
  return setAccount(
    { ...result, session: { ...session, addTimestamp: account.addTimestamp, logTimestamp: account.logTimestamp } },
    account.user.id,
  );
};
