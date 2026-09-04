import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import { CarnetDeBordSectionPlaceholderProps } from './types';

const DEFAULT_COUNT = 4;

export const CarnetDeBordSectionPlaceholder = React.memo(
  ({ count = DEFAULT_COUNT, style }: CarnetDeBordSectionPlaceholderProps) => (
    <Placeholder style={[styles.list, style]} Animation={Fade}>
      {Array.from({ length: count }, (_unused, index) => (
        <View key={index} style={styles.card}>
          <PlaceholderMedia style={styles.icon} />
          <View style={styles.lines}>
            <PlaceholderLine width={40} noMargin />
            <PlaceholderLine width={70} noMargin />
          </View>
        </View>
      ))}
    </Placeholder>
  ),
);
