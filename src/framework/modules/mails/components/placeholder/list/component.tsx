import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

const item = (firstLine, secondLine) => (
  <View style={styles.item}>
    <PlaceholderMedia size={32} style={styles.cloudy} isRound />
    <View style={styles.itemInfo}>
      <View style={styles.itemFirstLine}>
        <PlaceholderLine style={[styles.mb0, styles.h20, styles.grey]} width={firstLine} />
        <PlaceholderLine style={[styles.mb0, styles.h20, styles.cloudy]} width={10} />
      </View>
      <PlaceholderLine style={[styles.mb0, styles.h20, styles.cloudy]} width={secondLine} />
    </View>
  </View>
);

export default function MailsPlaceholderList() {
  return (
    <Placeholder Animation={Fade}>
      <View style={styles.page}>
        {item(50, 100)}
        {item(37, 55)}
        {item(43, 70)}
        {item(75, 85)}
        {item(63, 72)}
        {item(50, 100)}
        {item(37, 55)}
        {item(43, 70)}
        {item(75, 85)}
        {item(63, 72)}
      </View>
    </Placeholder>
  );
}
