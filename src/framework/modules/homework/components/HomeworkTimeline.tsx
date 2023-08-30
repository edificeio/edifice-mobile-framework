import * as React from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export interface IHomeworkTimelineProps {
  leftPosition: number;
  topPosition?: number;
  height?: number;
  color?: ColorValue;
}

const styles = StyleSheet.create({
  timeline: {
    width: UI_SIZES.dimensions.width.tiny,
    position: 'absolute',
  },
});

const HomeworkTimeline = ({ height, leftPosition, topPosition, color }: IHomeworkTimelineProps) => (
  <View
    style={[
      styles.timeline,
      {
        backgroundColor: color || theme.palette.grey.pearl,
        left: leftPosition,
        top: topPosition,
        height: height || UI_SIZES.screen.height,
      },
    ]}
  />
);

export default HomeworkTimeline;
