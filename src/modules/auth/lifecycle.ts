/**
 * The three things that modules attach to the life of a session: `sessionSetup` (before the session), `onSessionStart` and
 * `onSessionRelease`. See `app/module/types.ts` for what a module can do with them.
 *
 * Only that is here: calling the modules, with their `signal`, isolating their failures. What else comes with the start or the end of
 * a session (canceling the requests, emptying the stores, deciding who is released...) belongs to the flows, see `flows/end-session.ts` and `flows/start-session.ts`.
 * The flows call it (see `createAuthFlows`), with the modules given by the `AuthSessionProvider`.
 */

import type { ModuleWithSessionLifecycle } from '~/app/module/types';
import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/modules/auth/model';
import { SessionSetupError } from '~/modules/auth/model/error';

/** Runs a method without waiting for it: its failure is logged (unless its `signal` aborted: a canceled request fails on purpose). */
const runLifecycleMethod = (label: string, signal: AbortSignal, hook: () => void | Promise<void>) => {
  const report = (e: unknown) => {
    if (!signal.aborted) console.warn(`[Auth] ${label} failed:`, e);
  };
  try {
    return Promise.resolve(hook()).catch(report);
  } catch (e) {
    report(e);
    return Promise.resolve();
  }
};

const abortSession = (controller: AbortController) => {
  try {
    controller.abort();
  } catch (e) {
    // A listener of the signal must not prevent the session from ending
    console.warn('[Auth] A session abort listener failed:', e);
  }
};

/**
 * Gives the function that runs the `sessionSetup` of the given modules, together, before the session is created. Nothing is written here: it gives the
 * `commit` functions to call afterwards (see `runSetupCommits`). All or nothing: if one setup fails, the others are canceled (`signal`)
 * and no commit is given. There is no delay of its own: the requests are limited by the timeout of every network call.
 * @throws a `SessionSetupError`
 */
const createSessionSetupRunner = (modules: readonly ModuleWithSessionLifecycle[]) => async (session: AuthActiveAccount) => {
  const setups = modules.filter(({ sessionSetup }) => sessionSetup);
  if (setups.length === 0) return [];
  const controller = new AbortController();
  try {
    const results = await Promise.all(
      setups.map(async ({ name, sessionSetup }) => {
        try {
          return await sessionSetup!(session, { signal: controller.signal });
        } catch (e) {
          throw new SessionSetupError(name, e);
        }
      }),
    );
    return results.flatMap(result => (result && typeof result.commit === 'function' ? [result.commit] : []));
  } catch (e) {
    controller.abort();
    throw e;
  }
};

/**
 * Calls the `commit` functions in order. One that throws does not stop the sign-in nor the next ones: it is a programming
 * error, not an operational case (the network part is over). In debug it shows in the LogBox, else it is only logged.
 */
export const runSetupCommits = (commits: (() => void)[]) => {
  for (const commit of commits) {
    try {
      const result: unknown = commit();
      if (result instanceof Promise) console.warn('[Auth] A session commit must be synchronous: its promise is ignored.');
    } catch (e) {
      (__DEV__ ? console.error : console.warn)('[Auth] A session commit failed:', e);
    }
  }
};

/**
 * Calls what the modules attach to the life of a session, for the flows that start and end it (see `createAuthFlows`).
 * Without waiting for them, their failure is only logged.
 */
export const createSessionLifecycle = (modules: readonly ModuleWithSessionLifecycle[]) => {
  let current: { controller: AbortController; sessionId: string } | undefined;

  /**
   * Calls `onSessionRelease` of every module for the account: they undo what the sessions of the account left, durably.
   * No `signal` of its own: each request is already limited in time, and nothing cancels the release of an account.
   */
  const release = (account: AuthActiveAccount | AuthSavedLoggedInAccount) => {
    const signal = new AbortController().signal;
    for (const { name, onSessionRelease } of modules) {
      if (onSessionRelease) runLifecycleMethod(`${name}.onSessionRelease`, signal, () => onSessionRelease(account));
    }
  };

  return {
    /**
     * The session of the account ends, if it is the one running (otherwise nothing started, nothing to end): what the modules do
     * locally stops (`signal`), then they release what the session left (`onSessionRelease`).
     * To call BEFORE the accounts store changes: the account still has its tokens.
     */
    end(account: AuthActiveAccount | AuthSavedLoggedInAccount) {
      if (!current || current.sessionId !== account.user.id) return;
      const { controller } = current;
      current = undefined;
      abortSession(controller);
      release(account);
    },

    release,

    /**
     * Runs the `sessionSetup` of the modules before the session is created, see below.
     * @throws a `SessionSetupError`
     */
    runSetups: createSessionSetupRunner(modules),

    /** The session of the account starts: modules are told (`onSessionStart`, with a `signal` that aborts when it ends). */
    start(session: AuthActiveAccount) {
      // Defensive: a session is always ended before the next one starts
      if (current) abortSession(current.controller);
      const controller = new AbortController();
      current = { controller, sessionId: session.user.id };
      for (const { name, onSessionStart } of modules) {
        if (onSessionStart)
          runLifecycleMethod(`${name}.onSessionStart`, controller.signal, () =>
            onSessionStart(session, { signal: controller.signal }),
          );
      }
    },
  };
};

export type SessionLifecycle = ReturnType<typeof createSessionLifecycle>;
