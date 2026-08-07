import * as React from 'react';
import { View } from 'react-native';

import RNSvg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import styles from './styles';
import { BarLineProps } from './types';

const GRADIENT_ID = 'bar-line';

/**
 * background of a navBar or a tabBar, plus its colored line, given to `headerBackground` or to
 * `tabBarBackground`. it has to paint the background itself: react-navigation turns the bar
 * transparent as soon as one of these options is given.
 * ToDo: draw the SVG provided by design instead of the gradient once available.
 */
export function BarLine({ background, bar, line, onLayout }: BarLineProps) {
  const backgroundStyle = React.useMemo(() => [styles.background, { backgroundColor: background }], [background]);
  const lineStyle = React.useMemo(() => [styles.line, bar === 'tabBar' ? styles.lineTabBar : styles.lineNavBar], [bar]);

  return (
    <View style={backgroundStyle} onLayout={onLayout}>
      {line?.length ? (
        <RNSvg style={lineStyle}>
          <Defs>
            <LinearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="0">
              {line.map((color, index) => (
                <Stop key={index} offset={`${index / (line.length - 1 || 1)}`} stopColor={color} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${GRADIENT_ID})`} />
        </RNSvg>
      ) : null}
    </View>
  );
}
