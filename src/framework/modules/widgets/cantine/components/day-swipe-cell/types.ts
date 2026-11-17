import type { View, ViewProps } from 'react-native';

import type { useAnimatedStyle } from 'react-native-reanimated';

export interface DaySwipeCellProps extends ViewProps {
  ref?: React.Ref<View>;
}

export type DaySwipeStyle = ReturnType<typeof useAnimatedStyle>;
