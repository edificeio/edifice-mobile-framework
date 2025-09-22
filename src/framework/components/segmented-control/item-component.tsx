import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import { styles } from './styles';
import { SegmentedItemProps } from './types';

import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import { SmallBoldText, SmallText } from '~/framework/components/text';

const ACTIVE_CONTAINER_STYLE = [styles.activeContainer, styles.container];
const INACTIVE_CONTAINER_STYLE = [styles.inactiveContainer, styles.container];

const SegmentedControlItem = ({ count, isActive, onPress, text }: Readonly<SegmentedItemProps>) => {
  const TextComponent = isActive ? SmallBoldText : SmallText;

  return (
    <TouchableOpacity onPress={onPress} style={isActive ? ACTIVE_CONTAINER_STYLE : INACTIVE_CONTAINER_STYLE}>
      <TextComponent>{text}</TextComponent>
      <Badge content={count} color={theme.palette.primary.regular} />
    </TouchableOpacity>
  );
};

export default SegmentedControlItem;
