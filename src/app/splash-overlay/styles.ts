import { StyleSheet } from 'react-native';

// react-native-bootsplash draws the logo in a 288dp box (compat_splash_screen.xml), the size of the Android 12+
// splash icon. The poc override shrinks it with an inset (bootsplash_logo.xml) so it fits the system circle mask.
// Same box and inset here, so the logo does not move when this overlay takes over from the native splash.
const SPLASH_LOGO_BOX_SIZE = 288;
const SPLASH_LOGO_INSET_RATIO = 0.12;
const SPLASH_LOGO_SIZE = SPLASH_LOGO_BOX_SIZE * (1 - 2 * SPLASH_LOGO_INSET_RATIO);

export const styles = StyleSheet.create({
  background: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFill,
  },
  logo: {
    height: SPLASH_LOGO_SIZE,
    width: SPLASH_LOGO_SIZE,
  },
});
