import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const cardExplorer = (
  <View style={styles.cardExplorer}>
    <PlaceholderMedia
      size={(UI_SIZES.screen.width - UI_SIZES.spacing.medium * 3) / 2 - getScaleWidth(2)}
      style={[styles.pic, styles.pearl]}
    />
    <View style={styles.texts}>
      <PlaceholderLine width={80} style={styles.h22} />
      <PlaceholderLine width={50} style={[styles.h16, styles.pearl, styles.mb0]} />
    </View>
  </View>
);

export default function BlogPlaceholderExplorer() {
  return (
    <Placeholder Animation={Fade}>
      <View style={styles.page}>
        {cardExplorer}
        {cardExplorer}
        {cardExplorer}
      </View>
    </Placeholder>
  );
}
