import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

export default function EventCardPlaceholder() {
  return (
    <Placeholder Animation={Fade}>
      <View style={styles.container}>
        <View style={styles.pictoContainer}>
          <PlaceholderMedia style={[styles.w22, styles.h22, styles.br4, styles.picto]} />
        </View>
        <View style={styles.rightContainer}>
          <PlaceholderLine width={100} style={[styles.mb0, styles.h24, styles.br4]} />
          <PlaceholderLine width={40} style={[styles.mb0, styles.h24, styles.br4]} />
        </View>
      </View>
    </Placeholder>
  );
}
