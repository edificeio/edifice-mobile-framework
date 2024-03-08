import * as React from 'react';

import { I18n } from '~/app/i18n';
import { buildAbsoluteUserAvatarUrlWithPlatform } from '~/framework/components/avatar';
import AccountList from '~/framework/components/list/account';
import { HandleAccountListProps } from '~/framework/modules/auth/components/handle-account-list/types';
import appConf from '~/framework/util/appConf';

import { AuthLoggedAccount, AuthSavedAccount } from '../../model';

const HandleAccountList = <ItemT extends AuthSavedAccount | AuthLoggedAccount>({ data }: HandleAccountListProps<ItemT>, ref) => {
  return (
    <AccountList
      ref={ref}
      title={I18n.get('accountlist-handle-title')}
      description={I18n.get('accountlist-handle-description')}
      data={data}
      getAvatarSource={info => {
        const uri = buildAbsoluteUserAvatarUrlWithPlatform(info.item.user.id, appConf.getExpandedPlatform(info.item.platform));
        return uri
          ? {
              uri,
            }
          : undefined;
      }}
    />
  );
};

export default React.forwardRef(HandleAccountList);
