import * as React from 'react';

import AccountList from '~/framework/components/list/account';
import { AddAccountListProps } from '~/framework/modules/user/components/account-list/add/types';
import { I18n } from '~/util/i18n';

const AddAccountList = ({ data }: AddAccountListProps, ref) => {
  return (
    <AccountList
      ref={ref}
      title={I18n.get('accountlist-add-title')}
      description={I18n.get('accountlist-add-description')}
      data={data}
    />
  );
};

export default React.forwardRef(AddAccountList);
