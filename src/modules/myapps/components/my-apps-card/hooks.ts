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

const ANIMATION = {
  ROTATION_ANGLE: 360,
  ROTATION_DURATION: 850,
  SCALE_DOWN_DURATION: 300,
  SCALE_UP_DURATION: 500,
  UNFAVORITE_DURATION: 500,
};

/**
 * Animation of the favorite badge of a card: it spins and bounces in when the app becomes a favorite, shrinks out when it no longer is.
 * A card of FlashList is recycled for another app: then the badge takes the state of that app, without animation.
 */
export const useFavoriteBadgeAnimation = (appId: string, isFavorite: boolean) => {
  const scaleProgress = useSharedValue(isFavorite ? 1 : 0);
  const rotateProgress = useSharedValue(isFavorite ? ANIMATION.ROTATION_ANGLE : 0);

  const previousAppIdRef = React.useRef<string>(appId);
  const previousFavoriteRef = React.useRef<boolean>(isFavorite);

  React.useEffect(() => {
    if (previousAppIdRef.current !== appId) {
      previousAppIdRef.current = appId;
      previousFavoriteRef.current = isFavorite;
      scaleProgress.value = isFavorite ? 1 : 0;
      rotateProgress.value = isFavorite ? ANIMATION.ROTATION_ANGLE : 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, isFavorite]);

  const animatedFavoriteStyle = useAnimatedStyle(() => {
    const opacity = interpolate(rotateProgress.value, [0, 160, ANIMATION.ROTATION_ANGLE], [0, 0.4, 1], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ scale: scaleProgress.value }, { rotate: `${rotateProgress.value}deg` }],
    };
  });

  React.useEffect(() => {
    if (previousFavoriteRef.current === isFavorite) return;

    previousFavoriteRef.current = isFavorite;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFavorite]);

  return animatedFavoriteStyle;
};
