import React from 'react';

import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { UI_SIZES } from '~/framework/components/constants';

const ANIMATION = {
  ROTATION_ANGLE: 360,
  ROTATION_DURATION: 850,
  SCALE_DOWN_DURATION: 300,
  SCALE_UP_DURATION: 500,
  UNFAVORITE_DURATION: 500,
};

export const useController = (appId: string, isFavorite: boolean) => {
  const scaleProgress = useSharedValue(0);
  const rotateProgress = useSharedValue(0);

  const previousFavoriteRef = React.useRef<boolean | null>(null);

  const animatedFavoriteStyle = useAnimatedStyle(() => {
    const opacity = interpolate(rotateProgress.value, [0, 160, ANIMATION.ROTATION_ANGLE], [0, 0.4, 1], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ scale: scaleProgress.value }, { rotate: `${rotateProgress.value}deg` }],
    };
  });

  const imageDimensions = React.useMemo(
    () => ({
      height: UI_SIZES.spacing.huge,
      width: UI_SIZES.spacing.huge,
    }),
    [],
  );

  React.useEffect(() => {
    if (previousFavoriteRef.current === null) {
      scaleProgress.value = isFavorite ? 1 : 0;
      rotateProgress.value = isFavorite ? ANIMATION.ROTATION_ANGLE : 0;
      previousFavoriteRef.current = isFavorite;
      return;
    }

    if (previousFavoriteRef.current === isFavorite) return;

    if (isFavorite) {
      rotateProgress.value = 0;

      scaleProgress.value = withSequence(
        withTiming(1.35, {
          duration: ANIMATION.SCALE_UP_DURATION,
          easing: Easing.out(Easing.back(2.2)),
        }),
        withTiming(1, {
          duration: ANIMATION.SCALE_DOWN_DURATION,
          easing: Easing.out(Easing.cubic),
        }),
      );

      rotateProgress.value = withTiming(ANIMATION.ROTATION_ANGLE, {
        duration: ANIMATION.ROTATION_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      scaleProgress.value = withTiming(0, {
        duration: ANIMATION.UNFAVORITE_DURATION,
        easing: Easing.in(Easing.cubic),
      });
    }

    previousFavoriteRef.current = isFavorite;
  }, [isFavorite, rotateProgress, scaleProgress]);

  React.useEffect(() => {
    scaleProgress.value = isFavorite ? 1 : 0;
    rotateProgress.value = isFavorite ? ANIMATION.ROTATION_ANGLE : 0;
    previousFavoriteRef.current = isFavorite;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  return { animatedFavoriteStyle, imageDimensions };
};
