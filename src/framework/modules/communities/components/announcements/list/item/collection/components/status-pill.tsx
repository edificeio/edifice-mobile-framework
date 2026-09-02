import React from 'react';
import { View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { CollectionStatusColors } from '~/framework/modules/communities/components/announcements/list/item/collection/status';
import styles from '~/framework/modules/communities/components/announcements/list/item/collection/styles';

export const StatusPill = ({
  colors,
  icon,
  isCompleted,
  text,
}: Readonly<{ colors: CollectionStatusColors; icon?: SvgIconName; isCompleted: boolean; text: string }>) => {
  const contentStyle = { color: isCompleted ? colors.dark : colors.content };

  return (
    <View style={[styles.pill, { backgroundColor: colors.background }]}>
      {icon ? (
        <Svg
          name={icon}
          width={UI_SIZES.elements.icon.xsmall}
          height={UI_SIZES.elements.icon.xsmall}
          fill={isCompleted ? colors.dark : colors.content}
        />
      ) : null}
      <SmallText style={contentStyle}>{text}</SmallText>
    </View>
  );
};

export default StatusPill;
