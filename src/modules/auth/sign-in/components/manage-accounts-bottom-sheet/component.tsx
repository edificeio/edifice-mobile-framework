import * as React from 'react';

import AccountList from '~/framework/components/list/account';
import type { AccountListProps } from '~/framework/components/list/account/types';
import type { AuthLoggedAccount, AuthSavedAccount } from '~/modules/auth/model';
import { I18n } from '~/util/i18n';

import type { ManageAccountsBottomSheetProps } from './types';

/**
 * Bottom sheet that lists the saved accounts and lets the user remove them. Open it with `ref.present()`, close it with `ref.dismiss()`.
 */
const ManageAccountsBottomSheet = <ItemT extends AuthSavedAccount | AuthLoggedAccount>(
  props: ManageAccountsBottomSheetProps<ItemT>,
  ref,
) => {
  return (
    <AccountList
      ref={ref}
      title={I18n.get('auth-accountlist-handle-title')}
      description={I18n.get('auth-accountlist-handle-description')}
      data={props.data}
      onDelete={props.onDelete as AccountListProps<AuthSavedAccount | AuthLoggedAccount>['onDelete']}
    />
  );
};

export default React.forwardRef(ManageAccountsBottomSheet);
