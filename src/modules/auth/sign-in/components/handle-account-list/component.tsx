import * as React from 'react';

import AccountList from '~/framework/components/list/account';
import type { AccountListProps } from '~/framework/components/list/account/types';
import type { AuthLoggedAccount, AuthSavedAccount } from '~/modules/auth/model';
import { I18n } from '~/util/i18n';

import type { HandleAccountListProps } from './types';

const HandleAccountList = <ItemT extends AuthSavedAccount | AuthLoggedAccount>(props: HandleAccountListProps<ItemT>, ref) => {
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

export default React.forwardRef(HandleAccountList);
