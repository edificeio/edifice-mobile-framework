import * as React from 'react';
import { View } from 'react-native';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

export default function BlogPlaceholderDetails() {
  return (
    <Placeholder style={styles.page} Animation={Fade}>
      <View style={styles.user}>
        <PlaceholderMedia isRound style={styles.avatar} size={48} />
        <PlaceholderLine style={[styles.mb0, styles.h22]} width={50} />
      </View>
      <View style={styles.dateTitle}>
        <PlaceholderLine width={40} style={styles.h22} />
        <PlaceholderLine width={60} style={styles.h32} />
      </View>
      <PlaceholderLine style={styles.h20} />
      <PlaceholderLine width={50} style={styles.h20} />
      <PlaceholderMedia style={styles.content} />
    </Placeholder>
  );
}
