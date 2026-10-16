import { useAccountsStore } from '~/modules/auth/store/accounts';

import { AccountType, AuthLoggedAccount } from '.';

const MULTIPLE_ACCOUNT_ELIGIBLE_TYPES = [AccountType.Teacher, AccountType.Personnel, AccountType.Relative];
const MAX_ACCOUNTS = 2;

/**
 * As of 1.12.0, only Teachers and Personnel users can add only one another account.
 * As of 1.17.0, Parent users can also add only one another account.
 */
export const userCanAddAccount = (session?: AuthLoggedAccount) => {
  return (
    session &&
    MULTIPLE_ACCOUNT_ELIGIBLE_TYPES.includes(session.user.type) &&
    Object.keys(useAccountsStore.getState().accounts).length < MAX_ACCOUNTS
  );
};
