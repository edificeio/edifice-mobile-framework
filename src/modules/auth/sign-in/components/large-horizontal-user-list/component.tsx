import * as React from 'react';
import { FlatList as RNFlatList, StyleSheet, View, ViewStyle } from 'react-native';

import { buildRelativeUserAvatarUrl, SingleAvatar } from '~/framework/components/avatar';
import { SingleAvatarProps } from '~/framework/components/avatar/types';
import { UI_SIZES } from '~/framework/components/constants';
import { DISPLAY_NAME_NUMBER_OF_LINES, UserList, UserListItemDetails } from '~/framework/components/list/user-horizontal/component';
import { UserListItemProps, UserListProps } from '~/framework/components/list/user-horizontal/types';
import { SmallText } from '~/framework/components/text';
import { AccountTypeText } from '~/framework/components/text/account-type';
import appConf from '~/framework/util/appConf';
import type { DisplayUserPublic, DisplayUserPublicWithType } from '~/modules/auth/model';

import styles from './styles';
import { AccountSelectListProps } from './types';

export const LargeHorizontalUserListItemDetails = <ItemT extends DisplayUserPublicWithType = DisplayUserPublicWithType>({
  item,
}: UserListItemProps<ItemT>) => {
  return (
    <View style={styles.accountItemDetails}>
      <SmallText style={styles.accountItemDetailsText} numberOfLines={DISPLAY_NAME_NUMBER_OF_LINES}>
        {item.displayName}
      </SmallText>
      <AccountTypeText type={item.type} style={styles.accountItemDetailsText} />
    </View>
  );
};

const UserExternalListItem = <
  ItemT extends DisplayUserPublicWithType & { platform?: string } = DisplayUserPublicWithType & { platform?: string },
>(
  props: UserListItemProps<ItemT>,
) => {
  const { renderUserDetails, style, ...info } = props;
  const { id, platform } = info.item;
  const platformUrl = React.useMemo(() => (platform ? appConf.getPlatformByName(platform)?.url : undefined), [platform]);
  const avatarProps: SingleAvatarProps = React.useMemo(
    () => (platformUrl ? { size: 'xxl', source: { uri: `${platformUrl}${buildRelativeUserAvatarUrl(id)}` } } : { size: 'xxl' }),
    [platformUrl, id],
  );
  return (
    <View style={style}>
      <SingleAvatar {...avatarProps} border />
      {(renderUserDetails ?? UserListItemDetails)(info)}
    </View>
  );
};

type LargeHorizontalUserListItem = DisplayUserPublicWithType & { platform?: string };

export const LargeHorizontalUserList = React.forwardRef(
  <ItemT extends LargeHorizontalUserListItem = LargeHorizontalUserListItem>(
    props: AccountSelectListProps<ItemT>,
    ref: React.Ref<RNFlatList<ItemT>> | null | undefined,
  ) => {
    const { contentContainerStyle, itemContainerStyle, ...listProps } = props;
    const computedStyle = React.useMemo(
      () => StyleSheet.flatten([styles.accountContentContainer, contentContainerStyle]) as ViewStyle,
      [contentContainerStyle],
    );
    const gap = React.useMemo(() => {
      return (computedStyle.columnGap ?? computedStyle.gap ?? 0) as number;
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
        ref={ref as React.Ref<RNFlatList<DisplayUserPublic>>}
        {...(listProps as UserListProps<DisplayUserPublic>)}
        itemContainerStyle={realItemContainerStyle}
        contentContainerStyle={realContentContainerStyle}
        renderUserDetails={LargeHorizontalUserListItemDetails as UserListProps<DisplayUserPublic>['renderUserDetails']}
        userItemComponent={UserExternalListItem as UserListProps<DisplayUserPublic>['userItemComponent']}
      />
    );
  },
) as <ItemT extends LargeHorizontalUserListItem = LargeHorizontalUserListItem>(
  props: AccountSelectListProps<ItemT> & { ref?: React.Ref<RNFlatList<ItemT>> },
) => React.ReactElement;
