import * as React from 'react';

import { I18n } from '~/app/i18n';
import AccountList from '~/framework/components/list/account';
import { AuthLoggedAccount, AuthSavedAccount } from '~/framework/modules/auth/model';

import { ChangeAccountListProps } from './types';

const ChangeAccountList = <ItemT extends AuthSavedAccount | AuthLoggedAccount>(props: ChangeAccountListProps<ItemT>, ref) => {
  return (
    <AccountList<ItemT>
      ref={ref}
      title={I18n.get('auth-accountlist-change-title')}
      description={I18n.get('auth-accountlist-change-description')}
      data={props.data}
      onPress={props.onPress}
      onDelete={props.onDelete}
    />
  );
};

export default React.forwardRef(ChangeAccountList);
