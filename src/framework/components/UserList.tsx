/**
 * UserList
 *
 * Display a row of avatars and names that can handle touches.
 */
import * as React from 'react';
import { ListRenderItemInfo, StyleSheet, TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList, { FlatListProps } from '~/framework/components/flatList';
import { BadgeAvatarProps, TextAvatar } from '~/framework/components/textAvatar';
import { Status } from '~/ui/avatars/Avatar';

export interface IUserListItem {
  id: string;
  avatarId?: string;
  name: string;
}

export interface UserListProps extends Omit<FlatListProps<IUserListItem>, 'renderItem' | 'keyExtractor'> {
  selectedId?: IUserListItem['id'];
  onSelect?: (user: IUserListItem['id']) => void;
  renderBadge?: (user: IUserListItem, selectedId?: string) => Pick<BadgeAvatarProps, 'badgeContent' | 'badgeColor'>;
}

export default function UserList(props: UserListProps) {
  const { selectedId, onSelect, renderBadge, data, horizontal, ...otherProps } = props;
  const renderItem: FlatListProps<IUserListItem>['renderItem'] = React.useCallback(
    info => UserList.renderItem({ info, onSelect, renderBadge, selectedId, horizontal }),
    [onSelect, renderBadge, selectedId, horizontal],
  );
  return (
    <FlatList
      data={data}
      keyExtractor={UserList.keyExtractor}
      renderItem={renderItem}
      horizontal={horizontal}
      contentContainerStyle={
        horizontal ? UserList.styles.contentContainerStyleHorizontal : UserList.styles.contentContainerStyleVertical
      }
      alwaysBounceHorizontal={false}
      {...otherProps}
    />
  );
}
UserList.keyExtractor = (item: IUserListItem) => item.id;
UserList.renderItem = ({
  info,
  onSelect,
  renderBadge,
  selectedId,
  horizontal,
}: { info: ListRenderItemInfo<IUserListItem> } & Pick<UserListProps, 'onSelect' | 'renderBadge' | 'selectedId' | 'horizontal'>) => {
  console.log('render avatar', info.item.id, info.item.name);
  return (
    <TouchableOpacity
      style={horizontal ? UserList.styles.itemVertical : UserList.styles.itemHorizontal}
      onPress={() => onSelect?.(info.item.id)}>
      <TextAvatar
        text={info.item.name}
        textStyle={info.item.id === selectedId ? undefined : UserList.styles.itemText}
        userId={info.item.avatarId ?? info.item.id}
        {...(renderBadge ? renderBadge(info.item, selectedId) : undefined)}
        status={info.item.id === selectedId ? Status.selected : Status.disabled}
        isHorizontal={!horizontal}
      />
    </TouchableOpacity>
  );
};
UserList.styles = StyleSheet.create({
  contentContainerStyleVertical: {
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.extraLarge,
    marginBottom: -UI_SIZES.spacing.large, // Compoensate last item margin
  },
  contentContainerStyleHorizontal: {
    paddingVertical: UI_SIZES.spacing.extraLarge,
    paddingHorizontal: UI_SIZES.spacing.large,
    marginRight: -UI_SIZES.spacing.extraLarge, // Compoensate last item margin
  },
  itemVertical: { marginRight: UI_SIZES.spacing.extraLarge },
  itemHorizontal: { marginBottom: UI_SIZES.spacing.large },
  itemText: { color: theme.greyPalette.graphite },
});
