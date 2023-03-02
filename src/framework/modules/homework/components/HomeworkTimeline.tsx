import * as React from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export interface IHomeworkTimelineProps {
  leftPosition: number;
  topPosition?: number;
  color?: ColorValue;
}

const styles = StyleSheet.create({
  timeline: {
    width: UI_SIZES.dimensions.width.tiny,
    height: UI_SIZES.screen.height,
    position: 'absolute',
  },
});

const HomeworkTimeline = ({ leftPosition, topPosition, color }: IHomeworkTimelineProps) => (
  <View
    style={[
      {
        backgroundColor: color || theme.palette.grey.pearl,
        left: leftPosition,
        top: topPosition,
      },
      styles.timeline,
    ]}
  />
);

export default HomeworkTimeline;
