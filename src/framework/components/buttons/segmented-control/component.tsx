import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { styles } from './styles';
import { SegmentedControlProps } from './types';

import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import { SmallBoldText, SmallText } from '~/framework/components/text';

const SegmentedControl: React.FC<SegmentedControlProps> = ({ isActive, numberOfFilteredItems, onPress, text }) => {
  const TextComponent = React.useMemo(() => (isActive ? SmallBoldText : SmallText), [isActive]);

  if (!numberOfFilteredItems || numberOfFilteredItems === undefined) return undefined;

  return (
    <TouchableOpacity onPress={onPress}>
      {isActive ? (
        <View style={[styles.container, styles.activeContainer]}>
          <View style={styles.innerActive}>
            <TextComponent>{text}</TextComponent>
            <View style={styles.badge}>
              <Badge content={numberOfFilteredItems} color={theme.palette.primary.regular} />
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.container, styles.inactiveContainer]}>
          <TextComponent>{text}</TextComponent>
          <View style={styles.badge}>
            <Badge content={numberOfFilteredItems} color={theme.palette.primary.regular} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};
export default SegmentedControl;
