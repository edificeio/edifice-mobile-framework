import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const COLLAPSED_WIDTH = getScaleWidth(40);
const CANCEL_WIDTH = 58;
const EXPANDED_WIDTH = UI_SIZES.screen.width - UI_SIZES.spacing.small * 2 - CANCEL_WIDTH;

export const useAnimatedSearchStyles = () => {
  const progress = useSharedValue(0);

  const open = () => {
    progress.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  };

  const close = () => {
    progress.value = withTiming(0, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    borderRadius: UI_SIZES.radius.huge - (UI_SIZES.radius.huge - UI_SIZES.radius.extraLarge) * progress.value,
    width: COLLAPSED_WIDTH + (EXPANDED_WIDTH - COLLAPSED_WIDTH) * progress.value,
  }));

  return {
    animatedContainerStyle: containerStyle,
    close,
    open,
  };
};
