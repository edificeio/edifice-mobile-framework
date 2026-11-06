import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import type { MenuStepsPlaceholderProps } from './types';

const PLACEHOLDER_STEPS = [
  { dishes: [45, 70, 60, 50], key: 'first' },
  { dishes: [65], key: 'second' },
  { dishes: [40], key: 'third' },
  { dishes: [55, 45], key: 'fourth' },
];

export function MenuStepsPlaceholder({ style }: Readonly<MenuStepsPlaceholderProps>) {
  return (
    <Placeholder Animation={Fade} style={style}>
      {PLACEHOLDER_STEPS.map(step => (
        <View key={step.key} style={styles.step}>
          <View style={styles.track}>
            <PlaceholderMedia isRound style={styles.dot} />
            <PlaceholderMedia style={styles.line} />
          </View>
          <View style={styles.content}>
            <PlaceholderLine width={40} noMargin style={styles.title} />
            {step.dishes.map((width, dishIndex) => (
              <View key={`${step.key}-${dishIndex}`} style={styles.dish}>
                <PlaceholderLine width={width} noMargin />
                <PlaceholderMedia isRound style={styles.label} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </Placeholder>
  );
}
