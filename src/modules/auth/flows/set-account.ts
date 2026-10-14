import { commitSignIn } from './commit-sign-in';
import type { SignInResult } from '../service/types';

/**
 * Makes the signed-in account the connected one, in place of the saved account it is meant to replace (`replacedAccountId`).
 * Without `replacedAccountId`, the account is added to the existing ones (first account, new account...).
 * If another account is connected, it is put to sleep.
 */
export const setAccount = (result: SignInResult) => commitSignIn(result);
