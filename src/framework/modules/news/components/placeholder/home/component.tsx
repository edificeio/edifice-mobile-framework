import * as React from 'react';
import { View } from 'react-native';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

const cardNews = (
  <View style={styles.cardNews}>
    <View style={styles.cardNews_top}>
      <PlaceholderMedia size={24} style={styles.cardNews_thumbnail} />
      <PlaceholderLine width={30} style={[styles.cardNews_threadText, styles.h14]} />
    </View>
    <PlaceholderLine width={30} style={[styles.cardNews_date, styles.pearl]} />
    <PlaceholderLine style={styles.h18} />
    <PlaceholderLine width={50} style={styles.h18} />
    <PlaceholderLine style={[styles.h18, styles.pearl]} />
    <PlaceholderLine width={60} style={[styles.cardNews_lastLine, styles.h18, styles.pearl]} />
  </View>
);

const itemThread = (
  <View style={styles.itemThread}>
    <PlaceholderMedia size={60} style={styles.itemThread_media} />
    <PlaceholderLine width={60} />
  </View>
);

export default function NewsPlaceholderHome(props: { withoutThreads?: boolean }) {
  return (
    <Placeholder style={styles.page} Animation={Fade}>
      {!props.withoutThreads ? (
        <View style={styles.threads}>
          {itemThread}
          {itemThread}
          {itemThread}
          {itemThread}
        </View>
      ) : null}
      {cardNews}
      {cardNews}
      {cardNews}
      {cardNews}
      {cardNews}
    </Placeholder>
  );
}
