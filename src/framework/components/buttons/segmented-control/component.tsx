import * as React from 'react';
import { View } from 'react-native';

import { styles } from './styles';
import { SegmentedControlProps } from './types';

import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import { SmallBoldText } from '~/framework/components/text';

const SegmentedControl: React.FC<SegmentedControlProps> = ({ numberOfFilteredItems, text }) => {
  if (!numberOfFilteredItems || numberOfFilteredItems === undefined) return;
  return (
    <View style={styles.container}>
      <SmallBoldText>{text}</SmallBoldText>
      <View style={styles.badge}>
        <Badge content={numberOfFilteredItems} color={theme.palette.primary.regular} />
      </View>
    </View>
  );
};
export default SegmentedControl;
