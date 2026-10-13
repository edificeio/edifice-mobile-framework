import { runAccountStorageMigrations } from '~/framework/util/storage/migrations';
import { runSetupCommits, type SessionLifecycle } from '~/modules/auth/lifecycle';
import { MAX_ACCOUNTS } from '~/modules/auth/model/business';
import { AccountError, AccountErrorCode } from '~/modules/auth/model/error';
import type { SignInResult } from '~/modules/auth/service/types';
import { useSignInStore } from '~/modules/auth/sign-in/store';
import { getSession, useAccountsStore } from '~/modules/auth/store/accounts';
import { usePlatformContextStore } from '~/modules/auth/store/platform-context';
import { usePlatformLegalUrlsStore } from '~/modules/auth/store/platform-legal-urls';

import type { EndSession } from './end-session';
import { notifyLegacyAccountSet } from './legacy-redux';
import type { SleepCurrentSession } from './sleep-current-session';
import type { StartSession } from './start-session';

type SetActiveAccountDependencies = {
  endSession: EndSession;
  runSetups: SessionLifecycle['runSetups'];
  sleepCurrentSession: SleepCurrentSession;
  startSession: StartSession;
};

/**
 * Gives `setActiveAccount`, tied to the way the modules run their `sessionSetup`.
 *
 * Makes the signed-in account the active one, in place of the saved account of id `accountToReplaceId`.
 * Without `accountToReplaceId`, the account is added to the existing ones (first account, new account...).
 * If another account is active, its session is put to sleep.
 * Also used to replace the active account by a fresher version of itself (see `refreshRequirements`).
 * @throws a `TOO_MANY_ACCOUNTS` error if there would be more than `MAX_ACCOUNTS` accounts afterwards, or a `SessionSetupError` if a module
 * could not load what it needs: either way nothing was changed.
 */
export const createSetActiveAccount =
  ({ endSession, runSetups, sleepCurrentSession, startSession }: SetActiveAccountDependencies) =>
  async ({ legalUrls, platformContext, session: nextSession }: SignInResult, accountToReplaceId?: string) => {
    // 1. What may fail comes first, so a failure changes nothing
    const accountIdsAfter = new Set(Object.keys(useAccountsStore.getState().accounts));
    if (accountToReplaceId !== undefined) accountIdsAfter.delete(accountToReplaceId);
    accountIdsAfter.add(nextSession.user.id);
    if (accountIdsAfter.size > MAX_ACCOUNTS) {
      throw new AccountError(AccountErrorCode.TOO_MANY_ACCOUNTS, `Maximum of ${MAX_ACCOUNTS} accounts reached`);
    }
    // The preferences of the account (new or not) are migrated before anything can read them
    await runAccountStorageMigrations(nextSession.user.id);
    // What the modules need before the session exists. It fails the sign-in (nothing changed) or gives what to write afterwards
    const commits = nextSession.requirement ? [] : await runSetups(nextSession);

    // 2. Platform config fetched during sign-in
    if (platformContext) usePlatformContextStore.getState().setContext(nextSession.platform.name, platformContext);
    if (legalUrls) usePlatformLegalUrlsStore.getState().setLegalUrls(nextSession.platform.name, legalUrls);

    // 3. Commit the account. If another one is active, it is put to sleep. The same one goes on with its session (new tokens, fresher
    // data), unless it has now something to fulfil first: then its session ends.
    const previousSession = getSession();
    const sameSession = previousSession?.user.id === nextSession.user.id;
    if (!sameSession) await sleepCurrentSession();
    else if (nextSession.requirement) endSession(previousSession);
    useAccountsStore.getState().setAccount(nextSession, accountToReplaceId);
    useSignInStore.getState().reset();

    // 4. Effects of the new session. With a requirement, the app can't be used yet: they'll run once it is fulfilled.
    if (!nextSession.requirement) {
      runSetupCommits(commits);
      notifyLegacyAccountSet(nextSession, accountToReplaceId);
      // The session of this account starts, but not again if it was already running. The one that was put to sleep was just released
      if (!sameSession) await startSession(nextSession, previousSession?.user.id);
    }
    return nextSession;
  };

export type SetActiveAccount = ReturnType<typeof createSetActiveAccount>;
