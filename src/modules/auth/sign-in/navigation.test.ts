import { type PlatformKind, setPlatforms } from '~/test-utils/app-conf';

import {
  getRouteForLoginRedirection,
  getRouteForOnboarding,
  getRouteForOneTimeCode,
  getRouteForPlatformSelect,
  getSignInNavigationState,
} from './navigation';
import type { SignInStatus } from './store';

/** The screen of the login of a platform, depending on how it signs its users in. */
const loginScreenOf = (kind: PlatformKind) =>
  ({ redirect: 'sign-in/redirect', standard: 'sign-in/credentials', wayf: 'sign-in/wayf-intro' })[kind];

const kinds: PlatformKind[] = ['standard', 'wayf', 'redirect'];

const names = (state: ReturnType<typeof getSignInNavigationState>) => state.routes?.map(route => route.name);

describe('the login screen of a platform', () => {
  beforeEach(() => setPlatforms(['standard']));

  it.each(kinds)('is chosen by how the platform signs in: %s', kind => {
    setPlatforms([kind]);
    expect(getRouteForLoginRedirection('pf1').name).toBe(loginScreenOf(kind));
  });

  it('for a standard platform gives the account to sign in, or else the login to fill in', () => {
    expect(getRouteForLoginRedirection('pf1', 'acc1', 'its-login', true)).toEqual({
      name: 'sign-in/credentials',
      params: { accountId: 'acc1', lockLogin: true, loginUsed: 'its-login', platform: 'pf1' },
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

describe('getSignInNavigationState (what the container tells it)', () => {
  beforeEach(() => setPlatforms(['standard']));

  it('starts from the welcome screen, or the way to log in, when it is told nothing', () => {
    expect(names(getSignInNavigationState({ showWelcome: true }))).toEqual(['sign-in/welcome']);
    expect(names(getSignInNavigationState({}))).toEqual(['sign-in/credentials']);
  });

  it('goes through the screens it is given, then to the login target', () => {
    const state = getSignInNavigationState({
      before: [{ name: 'somewhere/selector' }],
      login: { accountId: 'a', lockLogin: true, loginUsed: 'login', platform: 'pf1' },
    });
    expect(names(state)).toEqual(['somewhere/selector', 'sign-in/credentials']);
    expect(state.routes![1].params).toEqual({ accountId: 'a', lockLogin: true, loginUsed: 'login', platform: 'pf1' });
  });

  it('goes to the login of the status when there is no target', () => {
    const status: SignInStatus = { loginUsed: 'typed-login', platform: 'pf1', type: 'login' };
    expect(getSignInNavigationState({ status }).routes![0].params).toMatchObject({ loginUsed: 'typed-login', platform: 'pf1' });
  });
});
