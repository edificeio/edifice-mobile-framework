import * as React from 'react';
import { ColorValue, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export interface IHomeworkTimelineProps {
  color?: ColorValue;
}

const HomeworkTimeline = ({ color }: IHomeworkTimelineProps) => (
  <View
    style={{
      backgroundColor: color || '#F2F2F2',
      height: UI_SIZES.screenHeight,
      position: 'absolute',
      top: -6,
      width: 2,
      left: 24,
    }}
  />
);

export default HomeworkTimeline;
