import * as React from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export interface IHomeworkTimelineProps {
  leftPosition?: number;
  topPosition?: number;
  color?: ColorValue;
}

const styles = StyleSheet.create({
  timeline: {
    height: '100%',
    position: 'absolute',
    width: UI_SIZES.dimensions.width.tiny,
  },
});

const HomeworkTimeline = ({ color, leftPosition, topPosition }: IHomeworkTimelineProps) => (
  <View
    style={[
      styles.timeline,
      {
        backgroundColor: color || theme.palette.grey.pearl,
        left: leftPosition || UI_SIZES.spacing.minor,
        top: topPosition,
      },
    ]}
  />
);

export default HomeworkTimeline;
