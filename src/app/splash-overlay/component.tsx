import * as React from 'react';
// Plain react-native images: see BACKGROUND_SOURCE below.
// eslint-disable-next-line no-restricted-imports
import { Image, ImageBackground, Platform } from 'react-native';

import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { UI_ANIMATIONS } from '~/framework/components/constants';

import { styles } from './styles';
import { SplashOverlayProps } from './types';

// Android drawables set by each override. Plain react-native images: the framework Image wrapper
// would route these resource names through the session.
const BACKGROUND_SOURCE = { uri: 'background' };
const LOGO_SOURCE = { uri: 'logo' };

/**
 * react-native-bootsplash (and the Android 12+ SplashScreen API) only accepts a background color.
 * This overlay takes over from the native splash to show the background image while the app starts.
 */
const SplashOverlay = ({ onImageLoaded, visible }: Readonly<SplashOverlayProps>) => {
  const [isMounted, setIsMounted] = React.useState(true);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (visible) return;
    opacity.value = withTiming(0, { duration: UI_ANIMATIONS.fade.duration }, finished => {
      if (finished) runOnJS(setIsMounted)(false);
    });
  }, [opacity, visible]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return isMounted ? (
    <Animated.View pointerEvents="none" style={[styles.background, animatedStyle]}>
      <ImageBackground onLoadEnd={onImageLoaded} resizeMode="cover" source={BACKGROUND_SOURCE} style={styles.background}>
        <Image resizeMode="contain" source={LOGO_SOURCE} style={styles.logo} />
      </ImageBackground>
    </Animated.View>
  ) : null;
};

const PlatformSplashOverlay = (props: Readonly<SplashOverlayProps>) =>
  Platform.OS === 'android' ? <SplashOverlay {...props} /> : null;

export default PlatformSplashOverlay;
