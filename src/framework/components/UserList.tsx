/**
 * UserList
 *
 * Display a row of avatars and names that can handle touches.
 */
import * as React from 'react';
import { ListRenderItemInfo, TouchableOpacity } from 'react-native';

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

export interface UserListProps<ItemType extends IUserListItem>
  extends Omit<FlatListProps<ItemType>, 'renderItem' | 'keyExtractor'> {
  selectedId?: ItemType['id'];
  onSelect?: (user: ItemType['id']) => void;
  renderBadge?: (user: ItemType, selectedId?: string) => Pick<BadgeAvatarProps, 'badgeContent' | 'badgeColor'>;
  avatarSize?: number;
}

export default function UserList<ItemType extends IUserListItem>(props: UserListProps<ItemType>) {
  const { selectedId, onSelect, renderBadge, avatarSize, data, horizontal, ...otherProps } = props;
  const renderItem: FlatListProps<ItemType>['renderItem'] = React.useCallback(
    info => UserList.renderItem({ info, onSelect, renderBadge, avatarSize, selectedId, horizontal, data }),
    [onSelect, renderBadge, avatarSize, selectedId, horizontal, data],
  );
  return (
    <FlatList
      bottomInset={false}
      alwaysBounceHorizontal={false}
      data={data}
      keyExtractor={UserList.keyExtractor}
      renderItem={renderItem}
      horizontal={horizontal}
      contentContainerStyle={
        horizontal
          ? {
              paddingVertical: UI_SIZES.spacing.large,
              paddingHorizontal: UI_SIZES.spacing.large,
            }
          : undefined
      }
      {...otherProps}
    />
  );
}
UserList.keyExtractor = <ItemType extends IUserListItem>(item: ItemType) => item.id;
UserList.renderItem = <ItemType extends IUserListItem>({
  info,
  onSelect,
  renderBadge,
  avatarSize,
  selectedId,
  horizontal,
  data,
}: { info: ListRenderItemInfo<ItemType> } & Pick<
  UserListProps<ItemType>,
  'onSelect' | 'renderBadge' | 'avatarSize' | 'selectedId' | 'horizontal' | 'data'
>) => {
  const isLastItem = data && info.index === data.length - 1;
  return (
    <TouchableOpacity
      style={
        horizontal
          ? { marginRight: isLastItem ? undefined : UI_SIZES.spacing.extraLarge }
          : { marginBottom: isLastItem ? undefined : UI_SIZES.spacing.large }
      }
      onPress={() => onSelect?.(info.item.id)}
      disabled={!onSelect}>
      <TextAvatar
        text={info.item.name}
        textStyle={!selectedId || info.item.id === selectedId ? undefined : { color: theme.greyPalette.graphite }}
        userId={info.item.avatarId ?? info.item.id}
        {...(renderBadge ? renderBadge(info.item, selectedId) : undefined)}
        status={!selectedId ? undefined : info.item.id === selectedId ? Status.selected : Status.disabled}
        isHorizontal={!horizontal}
        size={avatarSize}
      />
    </TouchableOpacity>
  );
};
