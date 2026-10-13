import { createSavedAccount } from '~/test-utils/auth-accounts';

import { createRestoreAccount } from './restore-account';
import service from '../service';
import { useSignInStore } from '../sign-in/store';

jest.mock('../service', () => ({ __esModule: true, default: { signIn: { restore: jest.fn() } } }));
jest.mock('../tracking', () => ({
  __esModule: true,
  default: { loginRestore: {} },
  withTracking: (_event: unknown, action: () => unknown) => action(),
}));

const restore = service.signIn.restore as jest.Mock;
const loggable = () => ({ ...createSavedAccount({ id: 'a' }), platform: 'pf1' });
const withoutTokens = () => ({ ...createSavedAccount({ id: 'a' }), platform: 'pf1', tokens: undefined });

describe('restoreAccount: beforeLeave', () => {
  const calls: string[] = [];
  const setActiveAccount = jest.fn();
  const sleepCurrentSession = jest.fn(async () => {
    calls.push('sleep');
  });
  const restoreAccount = createRestoreAccount(setActiveAccount, sleepCurrentSession);
  const beforeLeave = jest.fn(async () => {
    calls.push(`beforeLeave:${useSignInStore.getState().status?.type}`);
  });

  beforeEach(() => {
    calls.length = 0;
    restore.mockReset();
    setActiveAccount.mockReset();
    beforeLeave.mockClear();
    sleepCurrentSession.mockClear();
    useSignInStore.setState(useSignInStore.getInitialState(), true);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('is called with the status already set, before the session sleeps, when the account has no tokens', async () => {
    expect(await restoreAccount(withoutTokens() as never, { beforeLeave })).toBeUndefined();
    expect(calls).toEqual(['beforeLeave:login', 'sleep']);
  });

  it('is called with the status already set, before the session sleeps, when the sign-in fails', async () => {
    restore.mockRejectedValue(new Error('nope'));
    expect(await restoreAccount(loggable() as never, { beforeLeave })).toBeUndefined();
    expect(calls).toEqual(['beforeLeave:login', 'sleep']);
  });

  it('is waited for before the session sleeps', async () => {
    let release = () => {};
    const slow = jest.fn(() => new Promise<void>(resolve => (release = resolve)));
    const result = restoreAccount(withoutTokens() as never, { beforeLeave: slow });
    await Promise.resolve();
    expect(slow).toHaveBeenCalled();
    expect(sleepCurrentSession).not.toHaveBeenCalled();
    release();
    await result;
    expect(sleepCurrentSession).toHaveBeenCalledTimes(1);
  });

  it('does not stop the session from sleeping if it fails', async () => {
    const failing = jest.fn().mockRejectedValue(new Error('boom'));
    await restoreAccount(withoutTokens() as never, { beforeLeave: failing });
    expect(sleepCurrentSession).toHaveBeenCalledTimes(1);
  });

  it('is not called if the account is signed in', async () => {
    const account = loggable();
    restore.mockResolvedValue({});
    setActiveAccount.mockResolvedValue(account);
    expect(await restoreAccount(account as never, { beforeLeave })).toBe(account);
    expect(beforeLeave).not.toHaveBeenCalled();
    expect(sleepCurrentSession).not.toHaveBeenCalled();
  });

  it('works without it', async () => {
    await restoreAccount(withoutTokens() as never);
    expect(sleepCurrentSession).toHaveBeenCalledTimes(1);
  });
});
