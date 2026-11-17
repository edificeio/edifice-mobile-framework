import * as React from 'react';
import { View } from 'react-native';

import { Svg } from '~/framework/components/picture';

import styles from './styles';
import { BarBackgroundProps } from './types';

/**
 * background of a navBar or a tabBar, plus its colored line, given to `headerBackground` or to
 * `tabBarBackground`. it has to paint the background itself: react-navigation turns the bar
 * transparent as soon as one of these options is given.
 */
export function BarBackground({ backgroundColor, barType, lineImage }: Readonly<BarBackgroundProps>) {
  const backgroundStyle = React.useMemo(() => [styles.background, { backgroundColor }], [backgroundColor]);
  const lineStyle = React.useMemo(() => [styles.line, barType === 'tabBar' ? styles.lineTabBar : styles.lineNavBar], [barType]);

  return (
    <View style={backgroundStyle}>
      {lineImage ? (
        <View style={lineStyle}>
          <Svg name={lineImage} width="100%" height="100%" preserveAspectRatio="none" />
        </View>
      ) : null}
    </View>
  );
}
