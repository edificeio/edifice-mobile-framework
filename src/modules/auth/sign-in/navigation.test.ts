import { type PlatformKind, setPlatforms } from '~/test-utils/app-conf';
import { createActiveAccount, createSavedAccount } from '~/test-utils/auth-accounts';

import {
  getRouteForLoginRedirection,
  getRouteForOnboarding,
  getRouteForOneTimeCode,
  getRouteForPlatformSelect,
  getSignInNavigationState,
} from './navigation';
import type { SignInStatus } from '../store/sign-in';

/** The screen of the login of a platform, depending on how it signs its users in. */
const loginScreenOf = (kind: PlatformKind) =>
  ({ redirect: 'sign-in/redirect', standard: 'sign-in/credentials', wayf: 'sign-in/wayf-intro' })[kind];

const kinds: PlatformKind[] = ['standard', 'wayf', 'redirect'];

/** Every combination to test: one platform or several, and how the first one signs in (the others are standard). */
const platformSetups = kinds.flatMap(kind => [
  { kinds: [kind], label: `one ${kind} platform` },
  { kinds: [kind, 'standard' as const], label: `several platforms, the first is ${kind}` },
]);

const names = (state: ReturnType<typeof getSignInNavigationState>) => state.routes?.map(route => route.name);

describe('the login screen of a platform', () => {
  beforeEach(() => setPlatforms(['standard']));

  it.each(kinds)('is chosen by how the platform signs in: %s', kind => {
    setPlatforms([kind]);
    expect(getRouteForLoginRedirection('pf1').name).toBe(loginScreenOf(kind));
  });

  it('for a standard platform gives the account to sign in, or else the login to fill in', () => {
    expect(getRouteForLoginRedirection('pf1', 'acc1', 'ignored')).toEqual({
      name: 'sign-in/credentials',
      params: { accountId: 'acc1', loginUsed: undefined, platform: 'pf1' },
    });
    expect(getRouteForLoginRedirection('pf1', undefined, 'typed-login')).toEqual({
      name: 'sign-in/credentials',
      params: { accountId: undefined, loginUsed: 'typed-login', platform: 'pf1' },
    });
  });

  it('for a federated platform gives the account and the platform', () => {
    setPlatforms(['wayf']);
    expect(getRouteForLoginRedirection('pf1', 'acc1')).toEqual({
      name: 'sign-in/wayf-intro',
      params: { accountId: 'acc1', platform: 'pf1' },
    });
  });

  it('for a platform with a redirection gives the platform only', () => {
    setPlatforms(['redirect']);
    expect(getRouteForLoginRedirection('pf1', 'acc1')).toEqual({ name: 'sign-in/redirect', params: { platform: 'pf1' } });
  });

  it('refuses a platform that does not exist', () => {
    expect(() => getRouteForLoginRedirection('nope')).toThrow('no platform');
  });

  it('is the one of the platform that is selected, with no account to sign in', () => {
    setPlatforms(['wayf']);
    expect(getRouteForPlatformSelect('pf1')).toEqual({
      name: 'sign-in/wayf-intro',
      params: { accountId: undefined, platform: 'pf1' },
    });
  });
});

describe('the first screen after the welcome (getRouteForOnboarding)', () => {
  it.each(kinds)('is the login screen when there is a single platform (%s)', kind => {
    setPlatforms([kind]);
    expect(getRouteForOnboarding().name).toBe(loginScreenOf(kind));
  });

  it.each(kinds)('is the choice of the platform when there are several, whatever the first one is (%s)', kind => {
    setPlatforms([kind, 'standard']);
    expect(getRouteForOnboarding()).toEqual({ name: 'sign-in/platforms', params: undefined });
  });
});

describe('the screen of an activation or password renew code', () => {
  it('is the activation screen, with the code as the password', () => {
    const status: SignInStatus = { code: '123', loginUsed: 'login', platform: 'pf1', type: 'activation' };
    expect(getRouteForOneTimeCode(status)).toEqual({
      name: 'sign-in/activation',
      params: { credentials: { password: '123', username: 'login' }, platform: 'pf1' },
    });
  });

  it('is the activation screen, which also knows the account if there is one', () => {
    const status: SignInStatus = { accountId: 'acc1', code: '123', loginUsed: 'login', platform: 'pf1', type: 'activation' };
    expect(getRouteForOneTimeCode(status)).toEqual({
      name: 'sign-in/activation',
      params: { accountId: 'acc1', credentials: { password: '123', username: 'login' }, platform: 'pf1' },
    });
  });

  it('is the renew password screen, which also knows the account if there is one', () => {
    const status: SignInStatus = { accountId: 'acc1', code: '456', loginUsed: 'login', platform: 'pf1', type: 'passwordRenew' };
    expect(getRouteForOneTimeCode(status)).toEqual({
      name: 'sign-in/renew-password',
      params: { accountId: 'acc1', credentials: { password: '456', username: 'login' }, platform: 'pf1' },
    });
  });
});

describe('getSignInNavigationState', () => {
  const state = (options: Partial<Parameters<typeof getSignInNavigationState>[0]> = {}) =>
    getSignInNavigationState({ accounts: {}, showWelcome: false, ...options });

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
      const status: SignInStatus = { loginUsed: 'typed-login', platform: 'pf1', type: 'restore' };
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
      expect(names(state({ accounts }))).toEqual(['sign-in/accounts']);
    });

    it('goes on to the login of the account of a failed restore', () => {
      setPlatforms(['standard', 'wayf']);
      const status: SignInStatus = { accountId: 'b', platform: 'pf2', type: 'restore' };
      expect(names(state({ accounts, status }))).toEqual(['sign-in/accounts', 'sign-in/wayf-intro']);
    });
  });

  describe('after an account was removed', () => {
    beforeEach(() => setPlatforms(['standard']));

    it('keeps the choice of the account, with a single account left, and does not go to its login', () => {
      expect(names(state({ accounts: saved(), lastDeletedAccount: 'gone' }))).toEqual(['sign-in/accounts']);
    });

    it('goes to the login anyway when a restore failed (the error is displayed there)', () => {
      const status: SignInStatus = { accountId: 'acc1', platform: 'pf1', type: 'restore' };
      expect(names(state({ accounts: saved(), lastDeletedAccount: 'gone', status }))).toEqual([
        'sign-in/accounts',
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
