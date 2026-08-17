import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { ICON_WRAPPER_SIZE } from '~/framework/modules/home/components/flash-message/card/constants';

import styles from './styles';

export const FlashMessagePlaceholder = React.memo(() => (
  <Placeholder style={styles.card} Animation={Fade}>
    <View style={styles.header}>
      <PlaceholderMedia size={ICON_WRAPPER_SIZE} isRound style={styles.icon} />
      <View style={styles.lines}>
        <PlaceholderLine style={styles.line} />
        <PlaceholderLine style={styles.line} />
        <PlaceholderLine width={70} style={styles.line} />
        <PlaceholderLine width={45} style={styles.lastLine} />
      </View>
    </View>
    <PlaceholderMedia style={styles.button} />
  </Placeholder>
));
