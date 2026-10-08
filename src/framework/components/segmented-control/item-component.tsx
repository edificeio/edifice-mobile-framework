import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import { SmallBoldText, SmallText } from '~/framework/components/text';

import { styles } from './styles';
import { SegmentedItemProps } from './types';

const ACTIVE_CONTAINER_STYLE = [styles.activeContainer, styles.container];
const INACTIVE_CONTAINER_STYLE = [styles.inactiveContainer, styles.container];

const SegmentedControlItem = ({ count, isActive, onPress, style, testID, text }: Readonly<SegmentedItemProps>) => {
  const TextComponent = isActive ? SmallBoldText : SmallText;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[isActive ? ACTIVE_CONTAINER_STYLE : INACTIVE_CONTAINER_STYLE, style]}
      testID={testID}>
      <TextComponent numberOfLines={1}>{text}</TextComponent>
      {count !== undefined && (
        <Badge content={count} color={count > 0 ? theme.palette.primary.regular : theme.palette.grey.stone} />
      )}
    </TouchableOpacity>
  );
};

export default SegmentedControlItem;
