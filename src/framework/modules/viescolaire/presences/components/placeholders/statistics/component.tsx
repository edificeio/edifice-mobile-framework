import * as React from 'react';
import { View } from 'react-native';
import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import StatisticsCardPlaceholder from '~/framework/modules/viescolaire/presences/components/placeholders/statistics-card';

import styles from './styles';

export default function StatisticsPlaceholder() {
  return (
    <Placeholder Animation={Fade}>
      <View style={styles.listContainer}>
        <PlaceholderLine width={40} style={[styles.mb0, styles.h22, styles.br4]} />
        <PlaceholderLine width={60} style={[styles.mb0, styles.h22, styles.br4, styles.countMethodText]} />
        <StatisticsCardPlaceholder />
        <StatisticsCardPlaceholder />
        <StatisticsCardPlaceholder />
        <PlaceholderLine width={50} style={[styles.mb0, styles.h22, styles.br4, styles.countMethodText]} />
        <StatisticsCardPlaceholder />
        <StatisticsCardPlaceholder />
      </View>
    </Placeholder>
  );
}
