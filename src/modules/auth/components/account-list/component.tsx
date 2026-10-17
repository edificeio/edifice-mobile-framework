import * as React from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';

import { buildAvatarSourceForAccount } from '~/framework/components/avatar';
import AccountListItem from '~/framework/components/list/account/item';
import styles from '~/framework/components/list/account/styles';
import { HeadingSText, SmallText } from '~/framework/components/text';
import type { AuthActiveAccount, AuthSavedAccount } from '~/modules/auth/model';
import { useSession } from '~/modules/auth/store/accounts';

type Account = AuthSavedAccount | AuthActiveAccount;

export interface AccountListProps {
  accounts: Account[];
  description: string;
  title: string;
  /** Called when the user chooses an account. */
  onPress?: (account: Account) => Promise<void>;
  /** Called when the user confirmed the removal of an account. */
  onDelete?: (account: Account) => Promise<void>;
}

const ItemSeparator = () => (
  <View style={styles.separatorContainer}>
    <View style={styles.separator} />
  </View>
);

/**
 * List of accounts, the connected one is highlighted. Meant to be shown in a modal (see `screens/switch-account.tsx`).
 */
export const AccountList = ({ accounts, description, onDelete, onPress, title }: AccountListProps) => {
  const activeId = useSession()?.user.id;
  const renderItem = React.useCallback<ListRenderItem<Account>>(
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
    <>
      <View style={styles.textContainer}>
        <HeadingSText>{title}</HeadingSText>
        <SmallText>{description}</SmallText>
      </View>
      <FlatList<Account> scrollEnabled={false} data={accounts} renderItem={renderItem} ItemSeparatorComponent={ItemSeparator} />
    </>
  );
};
