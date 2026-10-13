import { getSession, useAccountsStore } from '~/modules/auth/store/accounts';

import type { EndSession } from './end-session';

/**
 * Gives `sleepCurrentSession`: puts the session (if any) to sleep. It ends (modules release it, notifications included) and its data are
 * flushed, but the account stays in the accounts with its tokens.
 * An account with a requirement has no session to put to sleep (it never started), so it is left as is.
 */
export const createSleepCurrentSession = (endSession: EndSession) => async () => {
  const session = getSession();
  if (!session) return;
  endSession(session);
  useAccountsStore.getState().sleep();
};

export type SleepCurrentSession = ReturnType<typeof createSleepCurrentSession>;
