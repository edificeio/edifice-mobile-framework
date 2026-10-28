import { type SignInStatus, useSignInStore } from '~/modules/auth/sign-in/store';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import { type PlatformKind, setPlatforms } from '~/test-utils/app-conf';
import { createActiveAccount, createSavedAccount } from '~/test-utils/auth-accounts';
import { act, renderHook } from '~/test-utils/render-hook';

import type { AuthSavedLoggedInAccount } from '../model';
import {
  getAddAccountNavigationState,
  getLoadAccountNavigationState,
  useLoadAccountNavigationState,
} from './sign-in-navigation-state';

/** The screen of the login of a platform, depending on how it signs its users in. */
const loginScreenOf = (kind: PlatformKind) =>
  ({ redirect: 'sign-in/redirect', standard: 'sign-in/credentials', wayf: 'sign-in/wayf-intro' })[kind];

const kinds: PlatformKind[] = ['standard', 'wayf', 'redirect'];

/** Every combination to test: one platform or several, and how the first one signs in (the others are standard). */
const platformSetups = kinds.flatMap(kind => [
  { kinds: [kind], label: `one ${kind} platform` },
  { kinds: [kind, 'standard' as const], label: `several platforms, the first is ${kind}` },
]);

const names = (state: ReturnType<typeof getLoadAccountNavigationState>) => state.routes?.map(route => route.name);

describe('getLoadAccountNavigationState', () => {
  const state = (options: Partial<Parameters<typeof getLoadAccountNavigationState>[0]> = {}) =>
    getLoadAccountNavigationState({ accounts: {}, showWelcome: false, ...options });

  const saved = (id = 'acc1', platform = 'pf1') => ({ [id]: { ...createSavedAccount({ id }), platform } });

  describe.each(platformSetups)('with $label', ({ kinds: platformKinds }) => {
    const multiple = platformKinds.length > 1;
    const loginScreen = loginScreenOf(platformKinds[0]);

    beforeEach(() => setPlatforms(platformKinds));

    it('starts with the welcome screen alone on a first launch', () => {
      expect(names(state({ showWelcome: true }))).toEqual(['sign-in/welcome']);
    });

    it('goes to the choice of the platform, or to its login, once the welcome screen is not shown anymore and there is no account', () => {
      expect(names(state())).toEqual([multiple ? 'sign-in/platforms' : loginScreen]);
    });

    it('starts with the introduction screen alone when it is asked (add-account modal), whatever the platforms', () => {
      expect(names(getAddAccountNavigationState())).toEqual(['sign-in/introduction']);
    });

    it('puts the welcome screen first when it is shown, whatever comes next', () => {
      expect(names(state({ accounts: saved(), showWelcome: true }))[0]).toBe('sign-in/welcome');
    });

    it('goes to the login of the only saved account, after the choice of the platform if there are several', () => {
      const routes = state({ accounts: saved() }).routes!;
      expect(routes.map(route => route.name)).toEqual(multiple ? ['sign-in/platforms', loginScreen] : [loginScreen]);
      const login = routes[routes.length - 1];
      expect(login.params).toMatchObject(
        loginScreen === 'sign-in/redirect' ? { platform: 'pf1' } : { accountId: 'acc1', platform: 'pf1' },
      );
    });

    it('goes to the login of the platform of a failed restore without account, with the login to fill in', () => {
      const status: SignInStatus = { loginUsed: 'typed-login', platform: 'pf1', type: 'login' };
      const routes = state({ status }).routes!;
      expect(routes.map(route => route.name)).toEqual(multiple ? ['sign-in/platforms', loginScreen] : [loginScreen]);
      if (loginScreen === 'sign-in/credentials')
        expect(routes[routes.length - 1].params).toMatchObject({ loginUsed: 'typed-login' });
    });
  });

  describe('with an activation or password renew code', () => {
    beforeEach(() => setPlatforms(['standard', 'wayf']));

    it('goes to its screen only, after the welcome screen when it is shown', () => {
      const status: SignInStatus = { code: '1', loginUsed: 'login', platform: 'pf1', type: 'activation' };
      expect(names(state({ status }))).toEqual(['sign-in/activation']);
      expect(names(state({ showWelcome: true, status }))).toEqual(['sign-in/welcome', 'sign-in/activation']);
    });

    it('does not go through the introduction screen', () => {
      const status: SignInStatus = { code: '1', loginUsed: 'login', platform: 'pf1', type: 'activation' };
      expect(names(getAddAccountNavigationState(status))).toEqual(['sign-in/activation']);
    });

    it('ignores the saved accounts', () => {
      const status: SignInStatus = { accountId: 'acc1', code: '1', loginUsed: 'login', platform: 'pf1', type: 'passwordRenew' };
      expect(names(state({ accounts: saved(), status }))).toEqual(['sign-in/renew-password']);
    });
  });

  describe('with several saved accounts', () => {
    const accounts = { ...saved('a', 'pf1'), ...saved('b', 'pf2') };

    it.each([
      { label: 'one platform', platforms: ['standard' as const] },
      { label: 'several platforms', platforms: ['standard' as const, 'wayf' as const] },
    ])('goes to the choice of the account only, with $label', ({ platforms }) => {
      setPlatforms(platforms);
      expect(names(state({ accounts }))).toEqual(['auth/accounts']);
    });

    it('goes back to the login of the targeted account when the sign-in following an activation or a password change failed', () => {
      setPlatforms(['standard']);
      const status: SignInStatus = { accountId: 'a', loginUsed: 'typed-login', platform: 'pf1', type: 'login' };
      const routes = state({ accounts, status }).routes!;
      expect(routes.map(route => route.name)).toEqual(['auth/accounts', 'sign-in/credentials']);
      // The account is targeted, so the sign-in will replace it (and its own login is the one to fill in)
      expect(routes[1].params).toEqual({ accountId: 'a', lockLogin: true, loginUsed: 'login-a', platform: 'pf1' });
    });

    it('goes on to the login of the account of a failed restore', () => {
      setPlatforms(['standard', 'wayf']);
      const status: SignInStatus = { accountId: 'b', platform: 'pf2', type: 'login' };
      expect(names(state({ accounts, status }))).toEqual(['auth/accounts', 'sign-in/wayf-intro']);
    });
  });

  describe('after an account was removed', () => {
    beforeEach(() => setPlatforms(['standard']));

    it('keeps the choice of the account, with a single account left, and does not go to its login', () => {
      expect(names(state({ accounts: saved(), lastDeletedAccount: 'gone' }))).toEqual(['auth/accounts']);
    });

    it('goes to the login anyway when a restore failed (the error is displayed there)', () => {
      const status: SignInStatus = { accountId: 'acc1', platform: 'pf1', type: 'login' };
      expect(names(state({ accounts: saved(), lastDeletedAccount: 'gone', status }))).toEqual([
        'auth/accounts',
        'sign-in/credentials',
      ]);
    });

    it('goes back to the first screen when nothing is left', () => {
      expect(names(state({ lastDeletedAccount: 'gone' }))).toEqual(['sign-in/credentials']);
    });
  });

  it('knows the platform of an account saved as a platform (not only its name)', () => {
    setPlatforms(['standard']);
    const account = createActiveAccount({ id: 'acc1' });
    expect(names(state({ accounts: { acc1: { ...account, platform: { name: 'pf1' } as never } } }))).toEqual([
      'sign-in/credentials',
    ]);
  });

  it('asks for a new state each time (stale), so the navigator is reset', () => {
    setPlatforms(['standard']);
    expect(state().stale).toBe(true);
  });
});

const routeNames = (state: ReturnType<typeof useLoadAccountNavigationState>) => state.routes?.map(route => route.name);
const savedAccounts = (...ids: string[]) =>
  Object.fromEntries(ids.map(id => [id, { ...createSavedAccount({ id }), platform: 'pf1' }]));

describe('useLoadAccountNavigationState', () => {
  beforeEach(() => {
    setPlatforms(['standard']);
    useAccountsStore.setState(useAccountsStore.getInitialState(), true);
    useSignInStore.setState(useSignInStore.getInitialState(), true);
  });

  const start = (...ids: string[]) => {
    useAccountsStore.getState().hydrate(savedAccounts(...ids), false);
    useSignInStore.getState().setStatus({ accountId: 'b', platform: 'pf1', type: 'login' });
    return renderHook(useLoadAccountNavigationState);
  };

  it('goes to the login screen the status says, and tells it was applied', () => {
    const { result } = start('a', 'b');
    expect(routeNames(result.current)).toEqual(['auth/accounts', 'sign-in/credentials']);
    expect(useSignInStore.getState().applied).toBeDefined();
    expect(useSignInStore.getState().status).toBeDefined();
  });

  it('does not change for an update of the tokens', () => {
    const { result } = start('a', 'b');
    const before = result.current;
    act(() => useAccountsStore.getState().refreshToken('b', (createSavedAccount({ id: 'b' }) as AuthSavedLoggedInAccount).tokens));
    expect(result.current).toBe(before);
    expect(useSignInStore.getState().status).toBeDefined();
  });

  it('follows the accounts alone, and closes the status, once they change: the user is not taken back to the login screen', () => {
    const { result } = start('a', 'b');
    // The user went back to the selector, then removes the other account
    act(() => useAccountsStore.getState().removeAccount('a'));
    expect(routeNames(result.current)).toEqual(['auth/accounts']);
    expect(useSignInStore.getState().status).toBeUndefined();
  });

  it('applies a new status again after one was closed', () => {
    const { result } = start('a', 'b');
    act(() => useAccountsStore.getState().removeAccount('a'));
    act(() => useSignInStore.getState().setStatus({ accountId: 'b', platform: 'pf1', type: 'login' }));
    expect(routeNames(result.current)).toEqual(['auth/accounts', 'sign-in/credentials']);
  });
});
