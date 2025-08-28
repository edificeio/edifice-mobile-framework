import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

export default function MailsPlaceholderEdit() {
  return (
    <Placeholder Animation={Fade}>
      <View style={styles.input}>
        <PlaceholderLine style={styles.h22} width={46} />
        <PlaceholderLine style={styles.h22} width={10} />
      </View>
      <View style={styles.input}>
        <PlaceholderLine style={styles.h22} width={62} />
      </View>
      <View style={styles.content}>
        <PlaceholderMedia style={styles.body} />
      </View>
      <View style={styles.attachments}>
        <PlaceholderLine style={styles.h46} />
      </View>
    </Placeholder>
  );
}
