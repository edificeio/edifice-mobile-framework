import type { AuthActiveAccount, AuthSavedAccount } from '~/modules/auth/model';

/**
 * Sheet that lists the saved accounts, the connected one highlighted. It closes by itself when there are less than two accounts
 * (nothing left to choose from).
 *
 * The accounts can be removed by the user if `onDelete` is given (the template does it, removing the connected account logs it out first).
 * The template does not know why the accounts are listed: the caller decides what the texts are and what choosing an account does
 * (if it does anything). It is used to:
 * - switch account (`screens/switch-account.tsx`): `onPress` signs the account in;
 * - manage the accounts (`screens/manage-accounts.tsx`): no `onPress`.
 */
export interface AccountListSheetScreenTemplateProps {
  /** Text under the title. Nothing is shown if not given. */
  description?: string;
  /**
   * Called when the user confirmed the removal of an account, just before the template removes it (tracking...).
   * The accounts can only be removed if it is given: without it, the delete buttons are not shown.
   * Must be a stable reference.
   */
  onDelete?: (account: AuthSavedAccount | AuthActiveAccount) => void | Promise<void>;
  /** Title of the sheet. Nothing is shown if not given. */
  title?: string;
  /** Called when the user chooses an account. If not given, the accounts can't be chosen. */
  onPress?: (account: AuthSavedAccount | AuthActiveAccount) => Promise<void>;
}
