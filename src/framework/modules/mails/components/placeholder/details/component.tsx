import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

export default function MailsPlaceholderDetails() {
  return (
    <Placeholder Animation={Fade}>
      <View style={styles.page}>
        <PlaceholderLine style={[styles.h26, styles.cloudy]} width={80} />
        <View style={styles.header}>
          <PlaceholderMedia size={48} style={styles.grey} isRound />
          <View style={styles.texts}>
            <View style={styles.headerFirstLine}>
              <PlaceholderLine style={[styles.h22, styles.cloudy]} width={58} />
              <PlaceholderLine style={[styles.h26, styles.cloudy]} width={12} />
            </View>
            <PlaceholderLine style={[styles.h22, styles.cloudy]} width={37} />
          </View>
        </View>
        <PlaceholderMedia style={[styles.pearl, styles.media]} />
        <View style={styles.buttons}>
          <PlaceholderLine style={[styles.h38, styles.cloudy]} width={35} />
          <PlaceholderLine style={[styles.h38, styles.cloudy]} width={35} />
        </View>
      </View>
    </Placeholder>
  );
}
