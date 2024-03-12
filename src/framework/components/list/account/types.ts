import { FlatListProps } from 'react-native';

import { AuthLoggedAccount, AuthSavedAccount } from '~/framework/modules/auth/model';

import { SingleSourceAvatarSpecificProps } from '../../avatar/types';

export interface AccountListProps<ItemT extends AuthSavedAccount | AuthLoggedAccount> {
  data: ItemT[];
  description: string;
  title: string;
  getAvatarSource?: (
    ...args: Parameters<NonNullable<FlatListProps<ItemT>['renderItem']>>
  ) => SingleSourceAvatarSpecificProps['source'] | undefined;
}
