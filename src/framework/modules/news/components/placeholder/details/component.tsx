import * as React from 'react';
import { View } from 'react-native';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

export default function NewsPlaceholderDetails() {
  return (
    <Placeholder style={styles.page} Animation={Fade}>
      <View style={styles.topContent}>
        <PlaceholderMedia style={styles.thumbnailThread} size={24} />
        <PlaceholderLine width={40} style={[styles.mb0, styles.h14]} />
      </View>
      <View style={styles.mainContent}>
        <PlaceholderLine width={25} />
        <PlaceholderLine style={styles.h18} />
        <PlaceholderLine width={50} style={[styles.mb0, styles.h18]} />
        <View style={styles.owner}>
          <PlaceholderMedia style={[styles.ownerAvatar, styles.roundMedia]} size={30} />
          <PlaceholderLine style={[styles.mb0, styles.h16]} width={40} />
        </View>
        <PlaceholderMedia style={styles.content} />
      </View>
    </Placeholder>
  );
}
