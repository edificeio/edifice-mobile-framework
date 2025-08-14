import React from 'react';
import { View } from 'react-native';

import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

import { UI_SIZES } from '../constants';
import { SmallBoldText } from '../text';
import { SingleAvatar } from './single';
import styles from './styles';
import { AvatarStackProps, SingleAvatarProps, SingleUserAvatarSpecificProps } from './types';

import { I18n } from '~/app/i18n';

const MAX_TOTAL = 99;

export function AvatarStack({
  avatarItemStyle: _avatarItemStyle,
  items,
  size,
  style,
  total = items.length,
  ..._avatarItemProps
}: Readonly<AvatarStackProps>) {
  const [containerWidth, setContainerWidth] = React.useState(0);

  const displayableAvatarsCount = React.useMemo(() => {
    const itemWidth = (UI_SIZES.elements.avatar[size] * 3) / 4;
    const lastItemWidthBonus = UI_SIZES.elements.avatar[size] / 4;
    return Math.floor((containerWidth - lastItemWidthBonus) / itemWidth);
  }, [containerWidth, size]);

  const displayableItems = React.useMemo(
    () => (displayableAvatarsCount < items.length ? items.slice(0, displayableAvatarsCount) : items),
    [displayableAvatarsCount, items],
  );

  const avatarItemStyle = React.useMemo(
    () => [_avatarItemStyle, { marginHorizontal: -UI_SIZES.border.small - UI_SIZES.elements.avatar[size] / 8 }],
    [_avatarItemStyle, size],
  );

  const avatarItemProps = React.useMemo(
    () =>
      displayableItems.map((item, index) => {
        const key = typeof item === 'string' ? item : ((item as Partial<SingleUserAvatarSpecificProps>).userId ?? index.toString());
        const itemProps: Partial<SingleAvatarProps> = typeof item === 'string' ? { userId: item } : item;
        if (index === displayableItems.length - 1 && total !== items.length) {
          const displayedTotal = total > MAX_TOTAL ? I18n.get(`avatar-count-out-of-reach`, { count: MAX_TOTAL }) : total;
          itemProps.overlay = <SmallBoldText style={styles.overlayText}>{displayedTotal}</SmallBoldText>;
        }
        return { ...itemProps, style: avatarItemStyle, ..._avatarItemProps, key };
      }),
    [_avatarItemProps, avatarItemStyle, displayableItems, items.length, total],
  );

  const onLayout = React.useCallback<NonNullable<ViewProps['onLayout']>>(({ nativeEvent }) => {
    setContainerWidth(nativeEvent.layout.width);
  }, []);

  const containerStyle = React.useMemo(
    () => [style, styles.avatarStack, { paddingHorizontal: UI_SIZES.elements.avatar[size] / 8 }],
    [size, style],
  );

  return (
    <View onLayout={onLayout} style={containerStyle}>
      {avatarItemProps.map(item => (
        <SingleAvatar size={size} {...item} />
      ))}
    </View>
  );
}
