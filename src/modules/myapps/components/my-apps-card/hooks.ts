import React from 'react';
import { StyleSheet } from 'react-native';

import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import theme, { type ThemeColorName } from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

/** The main shade of a color of the palette. */
const getRegularColor = (color: ThemeColorName | undefined) => {
  if (color === undefined) return undefined;
  return color === 'primary' || color === 'secondary' ? theme.palette[color].regular : theme.palette.complementary[color].regular;
};

/** @param color the color of the app: the background of its card. */
export const useStyles = (color?: ThemeColorName) => {
  const backgroundColor = getRegularColor(color);

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        card: {
          alignItems: 'center',
          backgroundColor,
          borderColor: theme.palette.grey.cloudy,
          borderRadius: UI_SIZES.radius.newCard,
          borderWidth: getScaleWidth(0.85),
          height: getScaleWidth(88),
          justifyContent: 'center',
          position: 'relative',
          width: getScaleWidth(88),
        },
        contentContainer: {
          alignItems: 'center',
          width: '100%',
        },

        favoriteIcon: {
          left: -getScaleWidth(15),
          padding: UI_SIZES.spacing.tiny,
          position: 'absolute',
          top: -UI_SIZES.spacing.medium,
          zIndex: UI_SIZES.spacing.tinyExtra,
        },
        image: {
          borderRadius: UI_SIZES.radius.newCard,
          height: '100%',
          objectFit: 'fill',
          width: '100%',
        },
        letterFallbackStyle: {
          color: theme.ui.text.inverse,
          fontSize: UI_SIZES.spacing.large,
          includeFontPadding: false,
          lineHeight: UI_SIZES.spacing.large * 1.2,
          textAlignVertical: 'center',
        },
        title: {
          textAlign: 'center',
        },
        titleRow: {
          alignItems: 'center',
          columnGap: UI_SIZES.spacing.tiny,
          flexDirection: 'row',
          marginTop: UI_SIZES.spacing.small,
        },
        wrapper: {
          alignItems: 'center',
          borderRadius: UI_SIZES.radius.newCard,
          minHeight: getScaleWidth(134),
          paddingHorizontal: UI_SIZES.spacing.minor,
          paddingVertical: UI_SIZES.spacing.small,
          width: getScaleWidth(168),
        },
        wrapperPressed: {
          backgroundColor: theme.palette.grey.cloudy,
        },
      }),
    [backgroundColor],
  );

  return styles;
};

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
