import * as React from 'react';
import { ScrollView, View } from 'react-native';

import { styles } from './styles';
import { SegmentedControlProps } from './types';

import { SegmentedControlItem } from './';

const PARENT_ROW_STYLE = [styles.scrollContainer, styles.matchParentWidthRow];

const SegmentedControl = ({
  canUnselect,
  initialSelectedIndex,
  matchParentWidth,
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
          style={matchParentWidth ? styles.matchParentWidthItem : undefined}
          testID={`segmented-control-${index}`}
          text={segment.text}
        />
      );
    });
  }, [segments, selectedIndex, canUnselect, matchParentWidth, onChange]);

  return (
    <ScrollView
      style={matchParentWidth ? styles.matchParentWidthScrollView : undefined}
      contentContainerStyle={matchParentWidth ? styles.matchParentWidthContent : undefined}
      alwaysBounceHorizontal={false}
      horizontal
      showsHorizontalScrollIndicator={false}>
      <View style={matchParentWidth ? PARENT_ROW_STYLE : styles.scrollContainer}>{segmentItems}</View>
    </ScrollView>
  );
};
export default SegmentedControl;
