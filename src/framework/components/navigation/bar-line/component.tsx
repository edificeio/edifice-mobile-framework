import * as React from 'react';
import { View } from 'react-native';

import { Svg } from '~/framework/components/picture';

import styles from './styles';
import { BarLineProps } from './types';

/**
 * background of a navBar or a tabBar, plus its colored line, given to `headerBackground` or to
 * `tabBarBackground`. it has to paint the background itself: react-navigation turns the bar
 * transparent as soon as one of these options is given.
 */
export function BarLine({ background, bar, line }: BarLineProps) {
  const backgroundStyle = React.useMemo(() => [styles.background, { backgroundColor: background }], [background]);
  const lineStyle = React.useMemo(() => [styles.line, bar === 'tabBar' ? styles.lineTabBar : styles.lineNavBar], [bar]);

  return (
    <View style={backgroundStyle}>
      {line ? (
        <View style={lineStyle}>
          <Svg name={line} width="100%" height="100%" preserveAspectRatio="none" />
        </View>
      ) : null}
    </View>
  );
}
