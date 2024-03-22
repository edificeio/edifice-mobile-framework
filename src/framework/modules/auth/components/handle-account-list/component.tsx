import * as React from 'react';

import { I18n } from '~/app/i18n';
import AccountList from '~/framework/components/list/account';
import { HandleAccountListProps } from '~/framework/modules/auth/components/handle-account-list/types';

import { AuthLoggedAccount, AuthSavedAccount } from '../../model';

const HandleAccountList = <ItemT extends AuthSavedAccount | AuthLoggedAccount>(props: HandleAccountListProps<ItemT>, ref) => {
  return (
    <AccountList
      ref={ref}
      title={I18n.get('auth-accountlist-handle-title')}
      description={I18n.get('auth-accountlist-handle-description')}
      data={props.data}
      onDelete={props.onDelete}
    />
  );
};

export default React.forwardRef(HandleAccountList);
