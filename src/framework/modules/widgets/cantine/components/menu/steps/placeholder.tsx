import * as React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const PLACEHOLDER_STEPS = [
  { dishes: [45, 70, 60, 50], key: 'first' },
  { dishes: [65], key: 'second' },
  { dishes: [40], key: 'third' },
  { dishes: [55, 45], key: 'fourth' },
];

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: UI_SIZES.spacing.minor,
    paddingBottom: UI_SIZES.spacing.medium,
  },
  dish: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: TextSizeStyle.Medium.lineHeight,
  },
  dot: {
    height: UI_SIZES.elements.icon.mediumlarge,
    width: UI_SIZES.elements.icon.mediumlarge,
  },
  label: {
    height: UI_SIZES.elements.icon.xsmall,
    width: UI_SIZES.elements.icon.xsmall,
  },
  line: {
    borderRadius: 0,
    flex: 1,
    width: UI_SIZES.border.small,
  },
  step: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  title: {
    height: UI_SIZES.elements.icon.xsmall,
    marginVertical: (UI_SIZES.elements.icon.mediumlarge - UI_SIZES.elements.icon.xsmall) / 2,
  },
  track: {
    alignItems: 'center',
  },
});

export interface MenuStepsPlaceholderProps {
  style?: ViewStyle;
}

export function MenuStepsPlaceholder({ style }: MenuStepsPlaceholderProps) {
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
            {step.dishes.map(width => (
              <View key={`${step.key}-${width}`} style={styles.dish}>
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
