import type { AuthActiveAccount, AuthSavedAccount } from '~/modules/auth/model';

type Account = AuthSavedAccount | AuthActiveAccount;

/**
 * The user chooses among the accounts it saved: the template shows them, and calls the given actions.
 * It does not know what happens when an account is chosen, added or removed.
 */
export interface AccountsScreenTemplateProps {
  /** The accounts to choose from, in the order they must be displayed. */
  accounts: Account[];
  /** Shows a loading indicator over the screen (e.g. while the chosen account is being signed in). */
  loading?: boolean;
  /** The user chose an account. */
  onSelectAccount: (account: Account) => void | Promise<void>;
  /** The user wants to add an account. The "add account" button is only shown if this is given. */
  onAddAccount?: () => void;
  /**
   * The user wants to remove an account. If it throws, the account stays and the error is logged.
   * The "manage accounts" button (that opens the list of accounts to remove) is only shown if this is given.
   */
  onDeleteAccount?: (account: Account) => Promise<void>;
  /** The user opened the "manage accounts" list. */
  onOpenManageAccounts?: () => void;
}
