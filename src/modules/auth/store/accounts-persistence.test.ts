import { createActiveAccount, createSavedAccount } from '~/test-utils/auth-accounts';
import { loadAuthModules } from '~/test-utils/auth-modules';

import { AuthRequirement } from '../model';

const setup = (options?: Parameters<typeof loadAuthModules>[0]) => {
  const modules = loadAuthModules(options);
  modules.lib.reset();
  const { lib } = modules;
  return {
    ...modules,
    /** What the storage holds as JSON for a key of the auth module. */
    readJSON: (key: string) => {
      const raw = lib.getString(`auth.${key}`);
      return raw === undefined ? undefined : JSON.parse(raw);
    },
    /** Puts in the storage what a former launch of the app left. */
    seed: (key: string, value: unknown) => lib.set(`auth.${key}`, JSON.stringify(value)),
  };
};

describe('reading the storage (initAccountsStore)', () => {
  it('starts empty, with the welcome screen to show, on a first launch', () => {
    const { initAccountsStore, useAccountsStore } = setup();
    expect(initAccountsStore()).toEqual({ account: undefined, platform: undefined });
    expect(useAccountsStore.getState().accounts).toEqual({});
    expect(useAccountsStore.getState().showWelcome).toBe(true);
  });

  it('reads the saved accounts, and that the welcome screen is not shown anymore', () => {
    const { initAccountsStore, lib, seed, useAccountsStore } = setup();
    seed('accounts', { a: createSavedAccount({ id: 'a' }), b: createSavedAccount({ id: 'b' }) });
    lib.set('auth.show-onboarding', 0);
    initAccountsStore();
    expect(Object.keys(useAccountsStore.getState().accounts).sort()).toEqual(['a', 'b']);
    expect(useAccountsStore.getState().showWelcome).toBe(false);
  });

  it('nobody is connected after the read: the account to restore is given back instead', () => {
    const { initAccountsStore, seed, useAccountsStore } = setup();
    seed('accounts', { a: createSavedAccount({ id: 'a' }) });
    seed('startup', { account: 'a', platform: 'pf1' });
    const { account, platform } = initAccountsStore();
    expect(useAccountsStore.getState().connected).toBeUndefined();
    expect(account?.user.id).toBe('a');
    expect(platform).toBe('pf1');
  });

  it('restores the only saved account when there is no startup', () => {
    const { initAccountsStore, seed } = setup();
    seed('accounts', { a: createSavedAccount({ id: 'a' }) });
    expect(initAccountsStore().account?.user.id).toBe('a');
  });

  it('restores nothing when there are several saved accounts and no startup', () => {
    const { initAccountsStore, seed } = setup();
    seed('accounts', { a: createSavedAccount({ id: 'a' }), b: createSavedAccount({ id: 'b' }) });
    expect(initAccountsStore().account).toBeUndefined();
  });

  it('gives the platform of the startup when it has no account', () => {
    const { initAccountsStore, seed } = setup();
    seed('startup', { platform: 'pf1' });
    expect(initAccountsStore()).toEqual({ account: undefined, platform: 'pf1' });
  });

  it('drops the tokens that are fetched at each login, if some were saved', () => {
    const { initAccountsStore, seed, useAccountsStore } = setup();
    const account = createSavedAccount({ id: 'a' }) as ReturnType<typeof createSavedAccount> & { tokens: Record<string, unknown> };
    account.tokens = { ...account.tokens, carbonioToken: 'c', oneSessionId: { value: 'sid' }, queryParam: { value: 'qp' } };
    seed('accounts', { a: account });
    initAccountsStore();
    const tokens = (useAccountsStore.getState().accounts.a as typeof account).tokens;
    expect(tokens.carbonioToken).toBeUndefined();
    expect(tokens.oneSessionId).toBeUndefined();
    expect(tokens.queryParam).toBeUndefined();
    expect((tokens.access as { value: string }).value).toBe('access');
  });

  it('gives the origin of the platform to the tokens saved without one (before 1.16.3)', () => {
    const { initAccountsStore, seed, useAccountsStore } = setup();
    const account = createSavedAccount({ id: 'a' }) as ReturnType<typeof createSavedAccount> & { tokens: Record<string, unknown> };
    account.platform = 'pf1';
    account.tokens = { ...account.tokens, origin: undefined };
    seed('accounts', { a: account });
    initAccountsStore();
    expect((useAccountsStore.getState().accounts.a as typeof account).tokens.origin).toBe('https://pf1.test');
  });
});

describe('writing the storage (what follows the stores)', () => {
  it('writes the accounts when they change, as saved accounts (no profile, no rights)', () => {
    const { initAccountsStore, readJSON, useAccountsStore } = setup();
    initAccountsStore();
    useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a' }));
    const saved = readJSON('accounts').a;
    expect(saved).toMatchObject({
      platform: 'platform',
      user: { displayName: 'Name a', id: 'a', loginUsed: 'login-a', type: 'Teacher' },
    });
    expect(saved.tokens.access.value).toBe('access');
    expect(saved.rights).toBeUndefined();
    expect(saved.user.firstName).toBeUndefined();
  });

  it('does not write the tokens that are fetched at each login', () => {
    const { initAccountsStore, readJSON, useAccountsStore } = setup();
    initAccountsStore();
    useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a' }));
    useAccountsStore.getState().setOneSessionId('a', { value: 'sid' });
    useAccountsStore.getState().setQueryParamToken('a', { expiresAt: 'x', type: 'QueryParam', value: 'qp' });
    useAccountsStore.getState().setCarbonioToken('a', 'carbonio');
    const { tokens } = readJSON('accounts').a;
    expect(tokens.oneSessionId).toBeUndefined();
    expect(tokens.queryParam).toBeUndefined();
    expect(tokens.carbonioToken).toBeUndefined();
    expect(tokens.refresh.value).toBe('refresh');
  });

  it('saves a refreshed token', () => {
    const { initAccountsStore, readJSON, useAccountsStore } = setup();
    initAccountsStore();
    useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a' }));
    useAccountsStore.getState().refreshToken('a', { ...createActiveAccount().tokens, refresh: { value: 'new' } });
    expect(readJSON('accounts').a.tokens.refresh.value).toBe('new');
  });

  it('saves an account logged out without tokens, and one put to sleep with them', () => {
    const { initAccountsStore, readJSON, useAccountsStore } = setup();
    initAccountsStore();
    const { logout, setAccount, sleep } = useAccountsStore.getState();
    setAccount(createActiveAccount({ id: 'a' }));
    logout();
    expect(readJSON('accounts').a.tokens).toBeUndefined();
    setAccount(createActiveAccount({ id: 'b' }));
    sleep();
    expect(readJSON('accounts').b.tokens.refresh.value).toBe('refresh');
  });

  it('writes that the welcome screen is not shown anymore with the first account, and nothing before', () => {
    const { initAccountsStore, lib, useAccountsStore } = setup();
    initAccountsStore();
    expect(lib.data.has('auth.show-onboarding')).toBe(false);
    useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a' }));
    expect(lib.data.get('auth.show-onboarding')).toBe(0);
  });

  describe('the data of the account storages', () => {
    it('is erased for an account that is removed, and only for it', () => {
      const { initAccountsStore, lib, seed, useAccountsStore } = setup();
      seed('accounts', { a: createSavedAccount({ id: 'a' }), b: createSavedAccount({ id: 'b' }) });
      initAccountsStore();
      lib.set('@a.ns.value', 1);
      lib.set('@a.$migration.ns.m1', 1);
      lib.set('@b.ns.value', 2);
      lib.set('device.value', 3);
      useAccountsStore.getState().removeAccount('a');
      expect([...lib.data.keys()].filter(key => key !== 'auth.accounts').sort()).toEqual(['@b.ns.value', 'device.value']);
    });

    it('is erased for an account that is replaced by another one', () => {
      const { initAccountsStore, lib, seed, useAccountsStore } = setup();
      seed('accounts', { old: createSavedAccount({ id: 'old' }) });
      initAccountsStore();
      lib.set('@old.ns.value', 1);
      useAccountsStore.getState().setAccount(createActiveAccount({ id: 'new' }), 'old');
      expect(lib.data.has('@old.ns.value')).toBe(false);
    });

    it('is kept for an account that replaces itself', () => {
      const { initAccountsStore, lib, seed, useAccountsStore } = setup();
      seed('accounts', { a: createSavedAccount({ id: 'a' }) });
      initAccountsStore();
      lib.set('@a.ns.value', 1);
      useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a' }), 'a');
      expect(lib.data.get('@a.ns.value')).toBe(1);
    });
  });

  describe('the startup (the account to restore at next launch)', () => {
    it('is the connected account', () => {
      const { initAccountsStore, readJSON, useAccountsStore } = setup();
      initAccountsStore();
      useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a' }));
      expect(readJSON('startup')).toEqual({ account: 'a', platform: 'platform' });
    });

    it('is nothing once the connected account logs out', () => {
      const { initAccountsStore, lib, useAccountsStore } = setup();
      initAccountsStore();
      useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a' }));
      useAccountsStore.getState().logout();
      expect(lib.data.has('auth.startup')).toBe(false);
    });

    it('is the account that a failed restore waits for, once the account that was connected left', () => {
      const { initAccountsStore, readJSON, seed, useAccountsStore, useSignInStore } = setup();
      seed('accounts', { b: createSavedAccount({ id: 'b' }) });
      initAccountsStore();
      useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a' }));
      useSignInStore.getState().setStatus({ accountId: 'b', platform: 'platform', type: 'restore' });
      expect(readJSON('startup')).toEqual({ account: 'a', platform: 'platform' });
      useAccountsStore.getState().sleep();
      expect(readJSON('startup')).toEqual({ account: 'b', platform: 'platform' });
    });

    it('is the platform of a restore that has no account', () => {
      const { initAccountsStore, readJSON, useSignInStore } = setup();
      initAccountsStore();
      useSignInStore.getState().setStatus({ loginUsed: 'login', platform: 'pf1', type: 'restore' });
      expect(readJSON('startup')).toEqual({ platform: 'pf1' });
    });

    it('is nothing again when the sign-in goes back to the neutral situation', () => {
      const { initAccountsStore, lib, useSignInStore } = setup();
      initAccountsStore();
      useSignInStore.getState().setStatus({ loginUsed: 'login', platform: 'pf1', type: 'restore' });
      useSignInStore.getState().reset();
      expect(lib.data.has('auth.startup')).toBe(false);
    });

    it('is not written for a status that is not a restore (activation, password renew)', () => {
      const { initAccountsStore, lib, useSignInStore } = setup();
      initAccountsStore();
      useSignInStore.getState().setStatus({ code: '1', loginUsed: 'login', platform: 'pf1', type: 'activation' });
      expect(lib.data.has('auth.startup')).toBe(false);
    });

    // A restore that is waiting must survive what happens meanwhile (token refresh of another account, profile...)
    it('is only written when what it is made of changes', () => {
      const { initAccountsStore, lib, seed, useAccountsStore } = setup();
      seed('accounts', { a: createSavedAccount({ id: 'a' }) });
      seed('startup', { account: 'a', platform: 'platform' });
      initAccountsStore();
      lib.set('auth.startup', JSON.stringify({ account: 'kept', platform: 'platform' }));
      useAccountsStore.getState().setQueryParamToken('a', { expiresAt: 'x', type: 'QueryParam', value: 'qp' });
      useAccountsStore.getState().refreshToken('a', createActiveAccount().tokens);
      expect(JSON.parse(lib.getString('auth.startup')!)).toEqual({ account: 'kept', platform: 'platform' });
    });

    it('follows the account of a requirement like any connected account', () => {
      const { initAccountsStore, readJSON, useAccountsStore } = setup();
      initAccountsStore();
      useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a', requirement: AuthRequirement.MUST_CHANGE_PASSWORD }));
      expect(readJSON('startup')).toEqual({ account: 'a', platform: 'platform' });
    });
  });

  it('tells the preferences of the other modules that they belong to the connected account', () => {
    const { AccountStorageHandler, initAccountsStore, useAccountsStore } = setup();
    initAccountsStore();
    expect(AccountStorageHandler.peekAccountId()).toBeUndefined();
    useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a' }));
    expect(AccountStorageHandler.peekAccountId()).toBe('a');
    useAccountsStore.getState().logout();
    expect(AccountStorageHandler.peekAccountId()).toBeUndefined();
  });

  it('subscribes only once to the stores, even when it is initialized again', () => {
    const { initAccountsStore, lib, useAccountsStore } = setup();
    initAccountsStore();
    initAccountsStore();
    const writes = jest.spyOn(lib, 'set');
    useAccountsStore.getState().setAccount(createActiveAccount({ id: 'a' }));
    const accountWrites = writes.mock.calls.filter(([key]) => key === 'auth.accounts');
    expect(accountWrites).toHaveLength(1);
  });
});
