import * as React from 'react';
import { ScrollView } from 'react-native';

import { styles } from './styles';
import { SegmentedControlProps } from './types';

import { SegmentedControlItem } from './';

const SegmentedControl = ({ canUnselect, initialSelectedIndex, onChange, segments }: Readonly<SegmentedControlProps>) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(initialSelectedIndex);

  return (
    <ScrollView
      alwaysBounceHorizontal={false}
      contentContainerStyle={styles.scrollContainer}
      horizontal
      showsHorizontalScrollIndicator={false}>
      {segments.map((segment, index) => {
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
            text={segment.text}
          />
        );
      })}
    </ScrollView>
  );
};

export default SegmentedControl;
