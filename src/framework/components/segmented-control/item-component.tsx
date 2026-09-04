import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import { SmallBoldText, SmallText } from '~/framework/components/text';

import { styles } from './styles';
import { SegmentedItemProps } from './types';

const ACTIVE_CONTAINER_STYLE = [styles.activeContainer, styles.container];
const INACTIVE_CONTAINER_STYLE = [styles.inactiveContainer, styles.container];

const SegmentedControlItem = ({
  badgeColor = theme.palette.primary.regular,
  count,
  isActive,
  onPress,
  testID,
  text,
}: Readonly<SegmentedItemProps>) => {
  const TextComponent = isActive ? SmallBoldText : SmallText;

  return (
    <TouchableOpacity onPress={onPress} style={isActive ? ACTIVE_CONTAINER_STYLE : INACTIVE_CONTAINER_STYLE} testID={testID}>
      <TextComponent>{text}</TextComponent>
      {count !== undefined && <Badge content={count} color={count > 0 ? badgeColor : theme.palette.grey.stone} />}
    </TouchableOpacity>
  );
};

export default SegmentedControlItem;
