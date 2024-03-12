import * as React from 'react';

import { I18n } from '~/app/i18n';
import AccountList from '~/framework/components/list/account';
import { ChangeAccountListProps } from '~/framework/modules/user/components/account-list/change/types';

const ChangeAccountList = ({ data }: ChangeAccountListProps, ref) => {
  return (
    <AccountList
      ref={ref}
      title={I18n.get('auth-accountlist-change-title')}
      description={I18n.get('auth-accountlist-change-description')}
      data={data}
    />
  );
};

export default React.forwardRef(ChangeAccountList);
