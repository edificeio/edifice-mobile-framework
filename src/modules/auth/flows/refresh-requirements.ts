import { signIn } from '../service';
import { commitSignIn } from './commit-sign-in';
import { assertConnectedAccount } from '../store/accounts';

/**
 * Checks again the requirement of the connected account (and updates its user data).
 * - If there still is one, the session is updated with it (only one at a time: the first the platform tells).
 * - If there is none left, the session starts, and the user goes into the app.
 * A refresh is not a sign-in: the account keeps its timestamps.
 * @throws if there is no connected account.
 */
export const refreshRequirements = async () => {
  const account = assertConnectedAccount();
  const { session, ...result } = await signIn.refresh(account);
  return commitSignIn(
    { ...result, session: { ...session, addTimestamp: account.addTimestamp, logTimestamp: account.logTimestamp } },
    account.user.id,
  );
};
