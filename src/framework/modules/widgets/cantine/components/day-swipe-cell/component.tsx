import * as React from 'react';

import Animated from 'react-native-reanimated';

import { useDaySwipeStyle } from './context';
import type { DaySwipeCellProps } from './types';

export const DaySwipeCell = ({ ref, style, ...props }: Readonly<DaySwipeCellProps>) => {
  const swipeStyle = useDaySwipeStyle();
  return <Animated.View ref={ref} {...props} style={[style, swipeStyle]} />;
};

export default DaySwipeCell;
