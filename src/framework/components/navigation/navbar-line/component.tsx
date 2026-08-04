import * as React from 'react';

import RNSvg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import theme from '~/app/theme';

import styles from './styles';

const GRADIENT_ID = 'navbar-line';

/**
 * colored line at the bottom of every navbar, rendered through `headerBackground`.
 * colors come from the palette, so each declension gets its own line.
 * ToDo: replace by the SVG provided by design once available.
 */
export function NavBarLine() {
  return (
    <RNSvg style={styles.line}>
      <Defs>
        <LinearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={theme.palette.primary.regular} />
          <Stop offset="1" stopColor={theme.palette.complementary.purple.regular} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${GRADIENT_ID})`} />
    </RNSvg>
  );
}
