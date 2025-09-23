import * as React from 'react';
import { ColorValue, StyleSheet, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export interface IAdaptiveTimelineProps {
  /** Position from the left edge */
  leftPosition?: number;
  /** Position from the top edge */
  topPosition?: number;
  /** Color of the timeline */
  color?: ColorValue;
  /** Width of the timeline */
  width?: number;
  /** Height of the timeline - defaults to 100% */
  height?: number | string;
  /** Custom style to override default styles */
  style?: ViewStyle;
  /** Whether the timeline should be horizontal instead of vertical */
  horizontal?: boolean;
  /** Opacity of the timeline */
  opacity?: number;
}

const styles = StyleSheet.create({
  horizontal: {
    height: UI_SIZES.dimensions.width.tiny,
    width: '100%',
  },
  timeline: {
    position: 'absolute',
  },
  vertical: {
    height: '100%',
    width: UI_SIZES.dimensions.width.tiny,
  },
});

const AdaptiveTimeline = ({
  color,
  height,
  horizontal = false,
  leftPosition,
  opacity = 1,
  style,
  topPosition,
  width,
}: IAdaptiveTimelineProps) => {
  const timelineStyle: ViewStyle = {
    backgroundColor: color || theme.palette.grey.pearl,
    left: horizontal ? 0 : leftPosition || UI_SIZES.spacing.minor,
    opacity,
    top: horizontal ? topPosition || 0 : topPosition,
  };

  if (height !== undefined) {
    timelineStyle.height = height as any;
  }
  if (width !== undefined) {
    timelineStyle.width = width;
  }

  return <View style={[styles.timeline, horizontal ? styles.horizontal : styles.vertical, timelineStyle, style]} />;
};

export default AdaptiveTimeline;
