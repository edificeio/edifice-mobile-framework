import type { SignInResult } from '~/modules/auth/service/types';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import { usePlatformContextStore } from '~/modules/auth/store/platform-context';
import { usePlatformLegalUrlsStore } from '~/modules/auth/store/platform-legal-urls';
import { useSignInStore } from '~/modules/auth/store/sign-in';

import { prepareSession, sleepCurrentSession, startSession } from './session-effects';

/**
 * Makes the signed-in account the active one, in place of the saved account of id `accountToReplaceId`.
 * Without `accountToReplaceId`, the account is added to the existing ones (first account, new account...).
 * If another account is active, its session is put to sleep.
 * Also used to replace the active account by a fresher version of itself (see `refreshRequirements`).
 */
export const setAccount = async ({ legalUrls, platformContext, session }: SignInResult, accountToReplaceId?: string) => {
  // 1. What may fail comes first, so a failure changes nothing
  if (!session.requirement) await prepareSession(session);

  // 2. Platform config fetched during sign-in
  if (platformContext) usePlatformContextStore.getState().setContext(session.platform.name, platformContext);
  if (legalUrls) usePlatformLegalUrlsStore.getState().setLegalUrls(session.platform.name, legalUrls);

  // 3. Commit the account. If another one is active, it is put to sleep.
  await sleepCurrentSession();
  useAccountsStore.getState().setAccount(session, accountToReplaceId);
  useSignInStore.getState().reset();

  // 4. Effects of the new session. With a requirement, the app can't be used yet: they'll run once it is fulfilled.
  if (!session.requirement) await startSession(session);
  return session;
};
