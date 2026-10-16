import { CommonActions } from '@react-navigation/native';

import type { AuthActiveAccount, AuthSavedAccount } from '~/framework/modules/auth/model';
import type { StackNavigationAction } from '~/framework/navigation/types';

/**
 * Navigation actions to log in again to an account that can't be switched to with its saved tokens.
 * The sign-in screens are now a private part of the auth module: the only way in from the outside is the add-account modal.
 * ToDo: target the account to sign in again once the add-account flow is migrated.
 * @deprecated use the new navigation, with the add-account modal of the auth module.
 */
export const getNavActionForAccountSwitch = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _account: Pick<AuthSavedAccount | AuthActiveAccount, 'platform' | 'method' | 'user'>,
) => [CommonActions.navigate({ name: 'auth/add-account' })] as StackNavigationAction[];
