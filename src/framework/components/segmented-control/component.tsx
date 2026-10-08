import * as React from 'react';
import { ScrollView, View } from 'react-native';

import { styles } from './styles';
import { SegmentedControlProps } from './types';

import { SegmentedControlItem } from './';

const FULL_WIDTH_ROW_STYLE = [styles.scrollContainer, styles.fullWidthRow];

const SegmentedControl = ({
  canUnselect,
  fullWidth,
  initialSelectedIndex,
  onChange,
  segments,
}: Readonly<SegmentedControlProps>) => {
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
          style={fullWidth ? styles.fullWidthItem : undefined}
          testID={`segmented-control-${index}`}
          text={segment.text}
        />
      );
    });
  }, [segments, selectedIndex, canUnselect, fullWidth, onChange]);

  return (
    <ScrollView
      style={fullWidth ? styles.fullWidthScrollView : undefined}
      contentContainerStyle={fullWidth ? styles.fullWidthContent : undefined}
      alwaysBounceHorizontal={false}
      horizontal
      showsHorizontalScrollIndicator={false}>
      <View style={fullWidth ? FULL_WIDTH_ROW_STYLE : styles.scrollContainer}>{segmentItems}</View>
    </ScrollView>
  );
};
export default SegmentedControl;
