import { StyleSheet } from 'react-native';

// Same size as the logo of the native splash (compat_splash_screen.xml, in the override and in react-native-bootsplash),
// so the logo does not move when this overlay takes over.
const SPLASH_LOGO_SIZE = 288;

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
