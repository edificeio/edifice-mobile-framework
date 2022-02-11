import * as React from 'react';
import { ColorValue, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export interface IHomeworkTimelineProps {
  leftPosition: number;
  color?: ColorValue;
}

const HomeworkTimeline = ({ leftPosition, color }: IHomeworkTimelineProps) => (
  <View
    style={{
      backgroundColor: color || theme.greyPalette.pearl,
      left: leftPosition,
      top: -UI_SIZES.spacing.small,
      width: UI_SIZES.dimensions.width.small,
      height: UI_SIZES.screenHeight,
      position: 'absolute',
    }}
  />
);

export default HomeworkTimeline;
