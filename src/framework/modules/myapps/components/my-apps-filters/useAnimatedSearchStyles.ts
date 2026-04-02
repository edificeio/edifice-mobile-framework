import { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { getScaleWidth } from '~/framework/components/constants';

const COLLAPSED_WIDTH = getScaleWidth(40);

const EXPANDED_WIDTH = getScaleWidth(275);
export const useAnimatedSearchStyles = () => {
  const progress = useSharedValue(0);

  const open = () => {
    progress.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  };

  const close = () => {
    progress.value = withTiming(0, {
      duration: 350,
      easing: Easing.in(Easing.cubic),
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    borderRadius: 25,
    width: COLLAPSED_WIDTH + (EXPANDED_WIDTH - COLLAPSED_WIDTH) * progress.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2], [1, 0]),
    pointerEvents: progress.value === 0 ? 'auto' : 'none',
    transform: [{ scale: 1 - 0.15 * progress.value }],
  }));

  const searchStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    pointerEvents: progress.value === 1 ? 'auto' : 'none',
  }));

  return {
    animatedContainerStyle: containerStyle,
    animatedIconStyle: iconStyle,
    animatedSearchStyle: searchStyle,
    close,
    open,
  };
};
