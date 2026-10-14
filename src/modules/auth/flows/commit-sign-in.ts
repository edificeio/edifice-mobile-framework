import { prepareSession, sleepCurrentSession, startSession } from './session-effects';
import type { SignInResult } from '../service/types';
import { useAccountsStore } from '../store/accounts';
import { usePlatformContextStore } from '../store/platform-context';
import { usePlatformLegalUrlsStore } from '../store/platform-legal-urls';
import { useSignInStore } from '../store/sign-in';

/**
 * Makes the signed-in account the connected one, steps in order.
 */
export const commitSignIn = async ({ legalUrls, platformContext, session }: SignInResult, accountToReplaceId?: string) => {
  // 1. What may fail comes first, so a failure changes nothing
  if (!session.requirement) await prepareSession(session);

  // 2. Platform config fetched during sign-in
  if (platformContext) usePlatformContextStore.getState().setContext(session.platform.name, platformContext);
  if (legalUrls) usePlatformLegalUrlsStore.getState().setLegalUrls(session.platform.name, legalUrls);

  // 3. Commit the account. If another one is connected, it is put to sleep.
  await sleepCurrentSession();
  useAccountsStore.getState().setAccount(session, accountToReplaceId);
  useSignInStore.getState().reset();

  // 4. Effects of the new session. With a requirement, the app can't be used yet: they'll run once it is fulfilled.
  if (!session.requirement) await startSession(session);
  return session;
};
