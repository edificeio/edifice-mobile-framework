import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

export default function CallCardPlaceholder() {
  return (
    <Placeholder Animation={Fade}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <PlaceholderLine width={100} style={[styles.mb0, styles.h24, styles.br4]} />
          <PlaceholderLine width={40} style={[styles.mb0, styles.h24, styles.br4, styles.heading]} />
        </View>
        <View style={styles.statusContainer}>
          <PlaceholderMedia style={[styles.w22, styles.h22, styles.br4, styles.status]} />
        </View>
      </View>
    </Placeholder>
  );
}
