import * as React from 'react';
import { ColorValue, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export interface IHomeworkTimelineProps {
  leftPosition: number;
  topPosition?: number;
  color?: ColorValue;
}

const HomeworkTimeline = ({ leftPosition, topPosition, color }: IHomeworkTimelineProps) => (
  <View
    style={{
      backgroundColor: color || theme.greyPalette.pearl,
      left: leftPosition,
      top: topPosition,
      width: UI_SIZES.dimensions.width.small,
      height: UI_SIZES.screenHeight,
      position: 'absolute',
    }}
  />
);

export default HomeworkTimeline;
