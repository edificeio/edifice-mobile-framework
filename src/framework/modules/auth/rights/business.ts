import { AccountType, AuthLoggedAccount } from '~/framework/modules/auth/model';
import { getAccountsNumber } from '~/framework/modules/auth/reducer';

const MULTIPLE_ACCOUNT_ELIGIBLE_TYPES = [AccountType.Teacher, AccountType.Personnel];
const MAX_ACCOUNTS = 2;

/**
 * As 1.12.0, only Teachers and Personnel users can add only one another account.
 */
export const userCanAddAccount = (session?: AuthLoggedAccount) => {
  return session && MULTIPLE_ACCOUNT_ELIGIBLE_TYPES.includes(session.user.type) && getAccountsNumber() < MAX_ACCOUNTS;
};
