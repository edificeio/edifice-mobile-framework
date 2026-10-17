import * as React from 'react';
import { FlatList, FlatListProps, ListRenderItem, View } from 'react-native';

import { buildAvatarSourceForAccount } from '~/framework/components/avatar';
import { HeadingSText, SmallText } from '~/framework/components/text';
import type { AuthLoggedAccount, AuthSavedAccount } from '~/modules/auth/model';
import { useSession } from '~/modules/auth/store/accounts';

import AccountListItem from './item-component';
import styles from './styles';

export interface AccountListProps extends Pick<FlatListProps<AuthSavedAccount | AuthLoggedAccount>, 'contentContainerStyle'> {
  ListComponent?: React.ComponentType<FlatListProps<AuthSavedAccount | AuthLoggedAccount>>;
  accounts: (AuthSavedAccount | AuthLoggedAccount)[];
  description?: string;
  title?: string;
  /** Called when the user chooses an account. */
  onPress?: (account: AuthSavedAccount | AuthLoggedAccount) => Promise<void>;
  /** Called when the user confirmed the removal of an account. */
  onDelete?: (account: AuthSavedAccount | AuthLoggedAccount) => Promise<void>;
}

const ItemSeparator = () => (
  <View style={styles.separatorContainer}>
    <View style={styles.separator} />
  </View>
);

/**
 * List of accounts, the connected one is highlighted. Meant to be shown in a modal (see `screens/switch-account.tsx`).
 */
export const AccountList = ({
  accounts,
  contentContainerStyle: _contentContainerStyle,
  description,
  ListComponent = FlatList,
  onDelete,
  onPress,
  title,
}: AccountListProps) => {
  const activeId = useSession()?.user.id;
  const renderItem = React.useCallback<ListRenderItem<AuthSavedAccount | AuthLoggedAccount>>(
    info => (
      <AccountListItem
        {...info}
        selected={info.item.user.id === activeId}
        getAvatarSource={i => buildAvatarSourceForAccount(i.item)}
        onPress={onPress && (item => onPress(item))}
        onDelete={onDelete && (item => onDelete(item))}
      />
    ),
    [activeId, onDelete, onPress],
  );
  return (
    <ListComponent
      ListHeaderComponent={
        title || description ? (
          <View style={styles.textContainer}>
            {title ? <HeadingSText>{title}</HeadingSText> : null}
            {description ? <SmallText>{description}</SmallText> : null}
          </View>
        ) : undefined
      }
      alwaysBounceVertical={false}
      data={accounts}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={React.useMemo(() => [styles.listContainer, _contentContainerStyle], [_contentContainerStyle])}
    />
  );
};
