import * as React from 'react';
import { FlatList, FlatListProps, View } from 'react-native';
import { useSelector } from 'react-redux';

import { default as AccountListItem } from '~/framework/components/list/account/item';
import styles from '~/framework/components/list/account/styles';
import { AccountListProps } from '~/framework/components/list/account/types';
import BottomSheetModal from '~/framework/components/modals/bottom-sheet';
import { HeadingSText, SmallText } from '~/framework/components/text';
import { AuthLoggedAccount, AuthSavedAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { ArrayElement } from '~/utils/types';

const ItemSeparator = () => (
  <View style={styles.separatorContainer}>
    <View style={styles.separator} />
  </View>
);

const AccountList = <ItemT extends AuthSavedAccount | AuthLoggedAccount>(
  { data, description, title, getAvatarSource, onPress, onDelete }: AccountListProps<ItemT>,
  ref,
) => {
  const currentAccount = useSelector(state => getSession());
  const renderItem: FlatListProps<ArrayElement<typeof data>>['renderItem'] = info => (
    <AccountListItem
      {...info}
      selected={info.item.user.id === currentAccount?.user.id}
      getAvatarSource={getAvatarSource}
      onPress={onPress}
      onDelete={onDelete}
    />
  );

  return (
    <BottomSheetModal ref={ref}>
      <View style={styles.textContainer}>
        <HeadingSText>{title}</HeadingSText>
        <SmallText>{description}</SmallText>
      </View>
      <FlatList<ArrayElement<typeof data>>
        scrollEnabled={false}
        data={data}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
      />
    </BottomSheetModal>
  );
};

export default React.forwardRef(AccountList);
