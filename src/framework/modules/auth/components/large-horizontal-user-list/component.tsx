import * as React from 'react';
import { FlatList as RNFlatList, StyleSheet, View, ViewStyle } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { DISPLAY_NAME_NUMBER_OF_LINES, UserList } from '~/framework/components/list/user-horizontal/component';
import { UserListItemProps } from '~/framework/components/list/user-horizontal/types';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { getProfileColorStyle } from '~/framework/components/text/account-type';
import { DisplayUserPublicWithType } from '~/framework/modules/auth/model';

import styles from './styles';
import { AccountSelectListProps } from './types';

export const LargeHorizontalUserListItemDetails = <ItemT extends DisplayUserPublicWithType = DisplayUserPublicWithType>({
  item,
}: UserListItemProps<ItemT>) => {
  const profileTextStyle = React.useMemo(() => [styles.accountItemDetailsText, getProfileColorStyle(item.type)], [item]);
  return (
    <View style={styles.accountItemDetails}>
      <SmallText style={styles.accountItemDetailsText} numberOfLines={DISPLAY_NAME_NUMBER_OF_LINES}>
        {item.displayName}
      </SmallText>
      <SmallBoldText style={profileTextStyle}>{item.type.toString()}</SmallBoldText>
    </View>
  );
};

export const LargeHorizontalUserList = React.forwardRef(
  <ItemT extends DisplayUserPublicWithType = DisplayUserPublicWithType>(
    props: AccountSelectListProps<ItemT>,
    ref: React.Ref<RNFlatList<ItemT>> | null | undefined,
  ) => {
    const { contentContainerStyle, itemContainerStyle, ...listProps } = props;
    const computedStyle = React.useMemo(
      () => StyleSheet.flatten([styles.accountContentContainer, contentContainerStyle]) as ViewStyle,
      [contentContainerStyle],
    );
    const gap = React.useMemo(() => {
      return computedStyle.columnGap ?? computedStyle.gap ?? 0;
    }, [computedStyle.columnGap, computedStyle.gap]);
    const padding = React.useMemo(() => (computedStyle.paddingHorizontal ?? 0) as number, [computedStyle.paddingHorizontal]);

    const itemStyle = React.useMemo(
      () => [
        styles.accountItem,
        {
          width: (UI_SIZES.screen.width - gap) / 2 - padding,
        },
      ],
      [gap, padding],
    );
    const realContentContainerStyle = React.useMemo(
      () => [styles.accountContentContainer, contentContainerStyle],
      [contentContainerStyle],
    );
    const realItemContainerStyle = React.useMemo(() => [itemStyle, itemContainerStyle], [itemStyle, itemContainerStyle]);
    return (
      <UserList
        ref={ref}
        {...listProps}
        itemContainerStyle={realItemContainerStyle}
        contentContainerStyle={realContentContainerStyle}
        renderUserDetails={LargeHorizontalUserListItemDetails}
      />
    );
  },
);
