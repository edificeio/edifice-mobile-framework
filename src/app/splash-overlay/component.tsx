import * as React from 'react';
// Plain react-native images: see BACKGROUND_SOURCE below.
// eslint-disable-next-line no-restricted-imports
import { Image, ImageBackground, Platform } from 'react-native';

import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { UI_ANIMATIONS } from '~/framework/components/constants';

import { styles } from './styles';
import { SplashOverlayProps } from './types';

// Android drawables set by each override. Plain react-native images: the framework Image wrapper
// would route these resource names through the session.
const BACKGROUND_SOURCE = { uri: 'background' };
const LOGO_SOURCE = { uri: 'logo' };

// In release builds the app starts so fast that the overlay would only flash: keep it on screen at least this long.
const SPLASH_MIN_DURATION = 2000;

/**
 * react-native-bootsplash (and the Android 12+ SplashScreen API) only accepts a background color.
 * This overlay takes over from the native splash to show the background image while the app starts.
 */
const SplashOverlay = ({ onImageLoaded, visible }: Readonly<SplashOverlayProps>) => {
  const [isMounted, setIsMounted] = React.useState(true);
  const opacity = useSharedValue(1);
  // Counted from when the image replaces the native splash, or from mount if it never loads.
  const shownAt = React.useRef(Date.now());

  const onLoadEnd = React.useCallback(() => {
    shownAt.current = Date.now();
    onImageLoaded();
  }, [onImageLoaded]);

  React.useEffect(() => {
    if (visible) return;
    const remainingDuration = Math.max(0, SPLASH_MIN_DURATION - (Date.now() - shownAt.current));
    opacity.value = withDelay(
      remainingDuration,
      withTiming(0, { duration: UI_ANIMATIONS.fade.duration }, finished => {
        if (finished) runOnJS(setIsMounted)(false);
      }),
    );
  }, [opacity, visible]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return isMounted ? (
    // Catches touches until unmounted: the app is already rendered underneath.
    <Animated.View style={[styles.background, animatedStyle]}>
      {/* Stretched like the native splash (gravity="fill"), so the gradient does not shift when this overlay takes over */}
      <ImageBackground onLoadEnd={onLoadEnd} resizeMode="stretch" source={BACKGROUND_SOURCE} style={styles.background}>
        <Image resizeMode="contain" source={LOGO_SOURCE} style={styles.logo} />
      </ImageBackground>
    </Animated.View>
  ) : null;
};

const PlatformSplashOverlay = (props: Readonly<SplashOverlayProps>) =>
  Platform.OS === 'android' ? <SplashOverlay {...props} /> : null;

export default PlatformSplashOverlay;
