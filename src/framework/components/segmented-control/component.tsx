import * as React from 'react';
import { ScrollView, View } from 'react-native';

import { styles } from './styles';
import { SegmentedControlProps } from './types';

import { SegmentedControlItem } from './';

const SegmentedControl = ({ canUnselect, initialSelectedIndex, onChange, segments }: Readonly<SegmentedControlProps>) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(initialSelectedIndex);

  const segmentItems = React.useMemo(() => {
    return segments.map((segment, index) => {
      const isSelected = selectedIndex === index;

      return (
        <SegmentedControlItem
          count={segment.count}
          id={segment.id}
          isActive={isSelected}
          key={segment.id}
          onPress={() => {
            const newIndex = isSelected && canUnselect ? undefined : index;
            setSelectedIndex(newIndex);
            onChange?.(newIndex);
          }}
          testID={`segmented-control-${index}`}
          text={segment.text}
        />
      );
    });
  }, [segments, selectedIndex, canUnselect, onChange]);

  return (
    <ScrollView alwaysBounceHorizontal={false} horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.scrollContainer}>{segmentItems}</View>
    </ScrollView>
  );
};
export default SegmentedControl;
