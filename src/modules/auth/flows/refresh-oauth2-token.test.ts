import { refreshTokenForAccount } from '~/framework/util/oauth2';
import { createActiveAccount } from '~/test-utils/auth-accounts';

import { refreshOAuth2Token } from './refresh-oauth2-token';
import type { AuthActiveAccount } from '../model';
import { useAccountsStore } from '../store/accounts';

jest.mock('~/framework/util/oauth2', () => ({ refreshTokenForAccount: jest.fn() }));

const refresh = refreshTokenForAccount as jest.Mock;
const tokens = (access: string) => ({ access, expires: 0, origin: 'https://x', refresh: `r-${access}`, scope: '', type: 'Bearer' });

describe('refreshOAuth2Token', () => {
  beforeEach(() => {
    refresh.mockReset();
    useAccountsStore.setState(useAccountsStore.getInitialState(), true);
  });

  it('refreshes once for concurrent callers and gives each the new tokens', async () => {
    const account = createActiveAccount({ id: 'a' });
    useAccountsStore.getState().setAccount(account);
    const other = { ...account } as AuthActiveAccount;
    refresh.mockResolvedValue(tokens('new'));
    await Promise.all([refreshOAuth2Token(account), refreshOAuth2Token(other)]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(account.tokens.access).toBe('new');
    expect(other.tokens.access).toBe('new');
    expect(useAccountsStore.getState().accounts.a).toMatchObject({ tokens: { access: 'new' } });
  });

  it('refreshes with the tokens of the store, not the ones of a stale object', async () => {
    const account = createActiveAccount({ id: 'a' });
    useAccountsStore.getState().setAccount(account);
    const stale = { ...account, tokens: tokens('stale') } as unknown as AuthActiveAccount;
    refresh.mockResolvedValue(tokens('new'));
    await refreshOAuth2Token(stale);
    expect(refresh.mock.calls[0][0].tokens.access).toBe(account.tokens.access);
  });

  it('refreshes again once the first refresh is over, also after a failure', async () => {
    const account = createActiveAccount({ id: 'a' });
    useAccountsStore.getState().setAccount(account);
    refresh.mockRejectedValueOnce(new Error('nope'));
    await expect(refreshOAuth2Token(account)).rejects.toThrow('nope');
    refresh.mockResolvedValue(tokens('new'));
    await refreshOAuth2Token(account);
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
