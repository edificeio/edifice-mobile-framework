import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

const cardBlog = (
  <View style={styles.cardBlog}>
    <PlaceholderLine width={85} style={[styles.h18, styles.pearl]} />
    <PlaceholderLine width={40} style={[styles.h18, styles.pearl]} />
    <View style={styles.cardBlog_top}>
      <PlaceholderMedia size={48} isRound style={styles.cardBlog_avatar} />
      <PlaceholderLine width={45} style={[styles.mb0, styles.h22]} />
    </View>
    <PlaceholderLine style={[styles.h72, styles.mb0, styles.pearl]} />
  </View>
);

export default function BlogPlaceholderList() {
  return (
    <Placeholder style={styles.page} Animation={Fade}>
      {cardBlog}
      {cardBlog}
      {cardBlog}
    </Placeholder>
  );
}
