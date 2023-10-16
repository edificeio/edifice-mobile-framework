import * as React from 'react';
import { View } from 'react-native';
import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import styles from './styles';

export default function CallSummaryPlaceholder() {
  return (
    <Placeholder Animation={Fade}>
      <View style={styles.topContent}>
        <PlaceholderLine width={45} style={[styles.mb0, styles.h26, styles.br4, styles.heading]} />
        <PlaceholderLine width={80} style={[styles.mb0, styles.h24, styles.br4]} />
        <PlaceholderLine width={30} style={[styles.mb0, styles.h24, styles.br4]} />
      </View>
      <PlaceholderLine width={50} style={[styles.mb0, styles.mt24, styles.h38, styles.br4, styles.action]} />
    </Placeholder>
  );
}
