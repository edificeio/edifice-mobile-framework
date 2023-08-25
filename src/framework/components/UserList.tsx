/**
 * UserList
 *
 * Display a row of avatars and names that can handle touches.
 */
import * as React from 'react';
import { ListRenderItemInfo, TouchableOpacity, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList, { FlatListProps } from '~/framework/components/list/flat-list';
import { BadgeAvatarProps, TextAvatar } from '~/framework/components/textAvatar';
import { Status } from '~/ui/avatars/Avatar';

import { TextSizeStyle } from './text';

export interface IUserListItem {
  id: string;
  avatarId?: string;
  name: string;
}

export interface UserListProps<ItemType extends IUserListItem = IUserListItem>
  extends Omit<FlatListProps<ItemType>, 'renderItem' | 'keyExtractor'> {
  selectedId?: ItemType['id'];
  onSelect?: (user: ItemType['id']) => void;
  renderBadge?: (user: ItemType, selectedId?: string) => Pick<BadgeAvatarProps, 'badgeContent' | 'badgeColor'>;
  avatarSize?: number;
  customItemStyle?: ViewStyle;
  withSeparator?: boolean;
}

function UserList<ItemType extends IUserListItem = IUserListItem>(props: UserListProps<ItemType>, ref) {
  const { selectedId, onSelect, renderBadge, avatarSize, data, customItemStyle, withSeparator, horizontal, ...otherProps } = props;
  const renderItem: FlatListProps<ItemType>['renderItem'] = React.useCallback(
    info =>
      UserList.renderItem({
        info,
        onSelect,
        renderBadge,
        avatarSize,
        selectedId,
        horizontal,
        data,
        customItemStyle,
        withSeparator,
      }),
    [onSelect, renderBadge, avatarSize, selectedId, horizontal, data, customItemStyle, withSeparator],
  );
  return (
    <FlatList
      ref={ref}
      data={data}
      renderItem={renderItem}
      keyExtractor={UserList.keyExtractor}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={!horizontal}
      bottomInset={false}
      alwaysBounceHorizontal={false}
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
  customItemStyle,
  withSeparator,
}: { info: ListRenderItemInfo<ItemType> } & Pick<
  UserListProps<ItemType>,
  'onSelect' | 'renderBadge' | 'avatarSize' | 'selectedId' | 'horizontal' | 'data' | 'customItemStyle' | 'withSeparator'
>) => {
  const isFirstItem = data && info.index === 0;
  const isLastItem = data && info.index === data.length - 1;
  return (
    <TouchableOpacity
      style={[
        horizontal
          ? { marginRight: isLastItem ? UI_SIZES.spacing.tiny : UI_SIZES.spacing.big }
          : {
              marginBottom: isLastItem ? undefined : UI_SIZES.spacing.medium,
              borderBottomWidth: !withSeparator || isLastItem ? 0 : 1,
              borderBottomColor: theme.palette.grey.cloudy,
            },
        { marginLeft: isFirstItem ? 2 : undefined },
        customItemStyle,
      ]}
      onPress={() => onSelect?.(info.item.id)}
      disabled={!onSelect}>
      <TextAvatar
        text={info.item.name}
        textStyle={[
          !selectedId || info.item.id === selectedId ? undefined : { color: theme.palette.grey.graphite },
          horizontal ? { ...TextSizeStyle.Small } : undefined,
        ]}
        userId={info.item.avatarId ?? info.item.id}
        {...(renderBadge ? renderBadge(info.item, selectedId) : undefined)}
        status={!selectedId ? undefined : info.item.id === selectedId ? Status.selected : Status.disabled}
        isHorizontal={!horizontal}
        size={avatarSize}
      />
    </TouchableOpacity>
  );
};

export default React.forwardRef(UserList);
