import { abortSignedRequests } from '~/framework/util/transport/in-flight';
import type { SessionLifecycle } from '~/modules/auth/lifecycle';
import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/modules/auth/model';
import { getSession } from '~/modules/auth/store/accounts';
import { resetSessionStores } from '~/modules/auth/store/session';

/**
 * Gives `endSession`: the session of the account ends, if it is the one running (otherwise nothing started, nothing to end).
 * Not a flow of its own: the sequence shared by the flows that make a session end (`logout`, `sleepCurrentSession`, `setAccount`).
 * 1. its signed requests in flight are canceled;
 * 2. the stores of the session are emptied (the legacy redux ones included);
 * 3. the modules stop what they do locally and release what the session left (`lifecycle.end`); their new requests are not canceled.
 * To call BEFORE the accounts store changes: the account still has its tokens.
 */
export const createEndSession = (lifecycle: SessionLifecycle) => (account: AuthActiveAccount | AuthSavedLoggedInAccount) => {
  if (getSession()?.user.id !== account.user.id) return;
  abortSignedRequests(account.user.id);
  resetSessionStores();
  lifecycle.end(account);
};

export type EndSession = ReturnType<typeof createEndSession>;
