import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from '~/framework/modules/widgets/cantine/components/home-widget/styles';

const PLACEHOLDER_STEPS = [
  { dishes: [45, 70, 60, 50], key: 'first' },
  { dishes: [65], key: 'second' },
  { dishes: [40], key: 'third' },
  { dishes: [55, 45], key: 'fourth' },
];

export function CantineWidgetPlaceholder() {
  return (
    <Placeholder Animation={Fade} style={styles.placeholder}>
      {PLACEHOLDER_STEPS.map(step => (
        <View key={step.key} style={styles.placeholderStep}>
          <View style={styles.placeholderTrack}>
            <PlaceholderMedia isRound style={styles.placeholderDot} />
            <PlaceholderMedia style={styles.placeholderLine} />
          </View>
          <View style={styles.placeholderContent}>
            <PlaceholderLine width={40} noMargin style={styles.placeholderTitle} />
            {step.dishes.map(width => (
              <View key={`${step.key}-${width}`} style={styles.placeholderDish}>
                <PlaceholderLine width={width} noMargin />
                <PlaceholderMedia isRound style={styles.placeholderLabel} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </Placeholder>
  );
}
