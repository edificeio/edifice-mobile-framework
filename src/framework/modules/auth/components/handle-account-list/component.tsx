import * as React from 'react';

import { I18n } from '~/app/i18n';
import AccountList from '~/framework/components/list/account';
import { HandleAccountListProps } from '~/framework/modules/auth/components/handle-account-list/types';

const HandleAccountList = ({ data }: HandleAccountListProps, ref) => {
  return (
    <AccountList
      ref={ref}
      title={I18n.get('accountlist-handle-title')}
      description={I18n.get('accountlist-handle-description')}
      data={data}
    />
  );
};

export default React.forwardRef(HandleAccountList);
