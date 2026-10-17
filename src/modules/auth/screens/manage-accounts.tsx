import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import AccountListSheetScreenTemplate, { accountListSheetOptions } from '~/modules/auth/templates/account-list-sheet';
import { trackingAccountEvents } from '~/modules/auth/tracking';
import { I18n } from '~/util/i18n';

/**
 * The user can remove the saved accounts it doesn't use anymore.
 */
const AuthManageAccountsScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  return (
    <AccountListSheetScreenTemplate
      description={I18n.get('auth-accountlist-handle-description')}
      title={I18n.get('auth-accountlist-handle-title')}
      onDelete={trackingAccountEvents.deleteAccountFromManageAccounts}
    />
  );
});
AuthManageAccountsScreen.displayName = 'AuthManageAccountsScreen';

export default defineModal({
  options: accountListSheetOptions,
  screen: AuthManageAccountsScreen,
});
