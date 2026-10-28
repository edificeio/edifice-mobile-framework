import type { AuthActiveAccount, AuthSavedAccount } from '~/modules/auth/model';

/**
 * Sheet that lists the saved accounts, the connected one highlighted. It closes by itself when there are less than two accounts
 * (nothing left to choose from).
 *
 * The accounts can be removed by the user if `onDelete` is given: the caller does it (confirmation, removal, feedback...).
 * The template does not know why the accounts are listed: the caller decides what the texts are and what choosing an account does
 * (if it does anything). It is used to:
 * - switch account (`screens/switch-account.tsx`): `onPress` signs the account in;
 * - manage the accounts (`screens/manage-accounts.tsx`): no `onPress`.
 */
export interface AccountListSheetScreenTemplateProps {
  /** Text under the title. Nothing is shown if not given. */
  description?: string;
  /**
   * Called when the user asks to remove an account (the delete button of the account): it must do all of it, the template does nothing.
   * The accounts can only be removed if it is given: without it, the delete buttons are not shown.
   * Must be a stable reference.
   */
  onDelete?: (account: AuthSavedAccount | AuthActiveAccount) => Promise<void>;
  /** Title of the sheet. Nothing is shown if not given. */
  title?: string;
  /** Called when the user chooses an account. If not given, the accounts can't be chosen. */
  onPress?: (account: AuthSavedAccount | AuthActiveAccount) => Promise<void>;
}
