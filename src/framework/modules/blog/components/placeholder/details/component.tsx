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
      <PlaceholderLine width={30} style={[styles.h12, styles.date, styles.pearl]} />
      <PlaceholderLine width={90} style={[styles.h18, styles.pearl]} />
      <PlaceholderLine width={50} style={[styles.h18, styles.pearl]} />
      <PlaceholderMedia style={styles.content} />
    </Placeholder>
  );
}
