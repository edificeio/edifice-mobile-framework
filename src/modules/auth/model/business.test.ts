import { createActiveAccount, createSavedAccount } from '~/test-utils/auth-accounts';

import { MAX_ACCOUNTS, userCanAddAccount } from './business';
import { useAccountsStore } from '../store/accounts';

import { AccountType } from '.';

describe('userCanAddAccount', () => {
  beforeEach(() => {
    useAccountsStore.setState(useAccountsStore.getInitialState(), true);
  });

  it('is false without a session', () => {
    expect(userCanAddAccount(undefined)).toBeFalsy();
  });

  it.each([AccountType.Teacher, AccountType.Personnel, AccountType.Relative])(
    'is true for a %s that has room for another account',
    type => {
      const session = createActiveAccount({ id: 'a', type });
      useAccountsStore.getState().setAccount(session);
      expect(userCanAddAccount(session)).toBe(true);
    },
  );

  it.each([AccountType.Student, AccountType.Guest, AccountType.External])('is false for a %s, whatever the room', type => {
    const session = createActiveAccount({ id: 'a', type });
    useAccountsStore.getState().setAccount(session);
    expect(userCanAddAccount(session)).toBe(false);
  });

  it('is false once there are as many accounts as the maximum', () => {
    const saved = Object.fromEntries(
      Array.from({ length: MAX_ACCOUNTS - 1 }, (_, index) => [`saved${index}`, createSavedAccount({ id: `saved${index}` })]),
    );
    useAccountsStore.getState().hydrate(saved, true);
    const session = createActiveAccount({ id: 'a', type: AccountType.Teacher });
    expect(userCanAddAccount(session)).toBe(true);
    useAccountsStore.getState().setAccount(session);
    expect(Object.keys(useAccountsStore.getState().accounts)).toHaveLength(MAX_ACCOUNTS);
    expect(userCanAddAccount(session)).toBe(false);
  });
});
