import type { ModuleWithSessionLifecycle } from '~/app/module/types';
import type { AuthSavedLoggedInAccount } from '~/modules/auth/model';
import { SessionSetupError } from '~/modules/auth/model/error';
import { createActiveAccount, createSavedAccount } from '~/test-utils/auth-accounts';

import { createSessionLifecycle, runSetupCommits, type SessionLifecycle } from './lifecycle';

const loaded: ModuleWithSessionLifecycle[] = [];
/** A module that is loaded, with these session callbacks. */
const registerModule = (name: string, callbacks: Omit<ModuleWithSessionLifecycle, 'name'>) => {
  loaded.push({ name, ...callbacks });
};
/** The lifecycle of the modules registered until now. */
const sessionLifecycle = (): SessionLifecycle => createSessionLifecycle(loaded);

const flush = () => new Promise(resolve => setImmediate(resolve));

beforeEach(() => {
  loaded.length = 0;
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('session lifecycle', () => {
  const session = (id = 'x') => createActiveAccount({ id });

  describe('onSessionStart', () => {
    it('is called with the session and a signal, in the order of registration', () => {
      const calls: string[] = [];
      registerModule('a', {
        onSessionStart: () => {
          calls.push('a');
        },
      });
      registerModule('b', {
        onSessionStart: (_s, { signal }) => {
          calls.push(`b:${signal.aborted}`);
        },
      });
      sessionLifecycle().start(session());
      expect(calls).toEqual(['a', 'b:false']);
    });

    it('logs a failure (sync or not) without breaking the others or the session', async () => {
      const ok = jest.fn();
      registerModule('sync', {
        onSessionStart: () => {
          throw new Error('sync');
        },
      });
      registerModule('async', { onSessionStart: async () => Promise.reject(new Error('async')) });
      registerModule('ok', { onSessionStart: ok });
      sessionLifecycle().start(session());
      await flush();
      expect(ok).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(2);
    });

    it('does not log the failure of a canceled request', async () => {
      registerModule('req', {
        onSessionStart: async (_s, { signal }) => {
          await flush();
          expect(signal.aborted).toBe(true);
          throw new Error('aborted request');
        },
      });
      const lifecycle = sessionLifecycle();
      const x = session();
      lifecycle.start(x);
      lifecycle.end(x);
      await flush();
      await flush();
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('end of the session', () => {
    it('aborts the signal, then releases the account that leaves, as it was given', () => {
      const order: string[] = [];
      let signal!: AbortSignal;
      registerModule('m', {
        onSessionRelease: account => {
          order.push(`release:${account.user.id}:${signal.aborted}`);
        },
        onSessionStart: (_s, options) => {
          signal = options.signal;
        },
      });
      const lifecycle = sessionLifecycle();
      const x = session();
      lifecycle.start(x);
      lifecycle.end(x);
      expect(order).toEqual(['release:x:true']);
    });

    it('does nothing for an account that has no session running', () => {
      const release = jest.fn();
      registerModule('m', { onSessionRelease: release });
      sessionLifecycle().end(session());
      expect(release).not.toHaveBeenCalled();
    });

    it('does nothing for another account than the one of the session', () => {
      const release = jest.fn();
      registerModule('m', { onSessionRelease: release });
      const lifecycle = sessionLifecycle();
      lifecycle.start(session('a'));
      lifecycle.end(session('b'));
      expect(release).not.toHaveBeenCalled();
    });

    it('ends only once', () => {
      const release = jest.fn();
      registerModule('m', { onSessionRelease: release });
      const lifecycle = sessionLifecycle();
      const x = session();
      lifecycle.start(x);
      lifecycle.end(x);
      lifecycle.end(x);
      expect(release).toHaveBeenCalledTimes(1);
    });
  });

  describe('onSessionRelease', () => {
    it('is directly available for any account with tokens, with a failure only logged', async () => {
      const failing = jest.fn(async () => Promise.reject(new Error('offline')));
      registerModule('m', { onSessionRelease: failing });
      sessionLifecycle().release(createSavedAccount({ id: 'y' }) as AuthSavedLoggedInAccount);
      await flush();
      expect(failing).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('session setup', () => {
  const session = createActiveAccount({ id: 'x' });

  it('gives the commits of the modules in the order of registration, ignoring the ones with nothing to write', async () => {
    const order: string[] = [];
    registerModule('a', {
      sessionSetup: async () => ({
        commit: () => {
          order.push('a');
        },
      }),
    });
    registerModule('none', { sessionSetup: () => undefined });
    registerModule('b', {
      sessionSetup: () => ({
        commit: () => {
          order.push('b');
        },
      }),
    });
    const commits = await sessionLifecycle().runSetups(session);
    expect(order).toEqual([]);
    runSetupCommits(commits);
    expect(order).toEqual(['a', 'b']);
  });

  it('fails the whole with the module that failed, and cancels the others', async () => {
    let signal!: AbortSignal;
    registerModule('slow', {
      sessionSetup: async (_s, options) => {
        signal = options.signal;
        return new Promise(() => {});
      },
    });
    registerModule('broken', { sessionSetup: async () => Promise.reject(new Error('network')) });
    const error = await sessionLifecycle()
      .runSetups(session)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SessionSetupError);
    expect(error).toMatchObject({ moduleName: 'broken' });
    expect(signal.aborted).toBe(true);
  });

  it('gives nothing when no module has a setup', async () => {
    expect(await sessionLifecycle().runSetups(session)).toEqual([]);
  });

  it('does not stop at a commit that throws, nor at one that gives a promise', () => {
    const next = jest.fn();
    runSetupCommits([
      () => {
        throw new Error('bug');
      },
      (async () => {}) as () => void,
      next,
    ]);
    expect(next).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
