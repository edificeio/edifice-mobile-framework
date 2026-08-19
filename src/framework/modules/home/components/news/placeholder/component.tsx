import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import blockStyles from '~/framework/modules/home/components/styles';

import { THUMBNAIL_SIZE } from '../constants';
import styles from './styles';

const card = (
  <Placeholder style={[blockStyles.block, styles.card]} Animation={Fade}>
    <View style={blockStyles.blockHeader}>
      <PlaceholderMedia size={THUMBNAIL_SIZE} style={styles.thumbnail} />
      <PlaceholderLine width={70} style={styles.threadTitle} />
    </View>
    <View style={[blockStyles.blockBody, styles.body]}>
      <PlaceholderLine style={styles.line} />
      <PlaceholderLine width={60} style={styles.line} />
      <PlaceholderLine style={styles.line} />
      <View style={styles.images}>
        <PlaceholderMedia style={styles.image} />
        <PlaceholderMedia style={styles.image} />
      </View>
    </View>
  </Placeholder>
);

export const NewsPlaceholder = React.memo(() => (
  <View style={styles.row}>
    {Array.from({ length: 2 }, (_, index) => (
      <React.Fragment key={index}>{card}</React.Fragment>
    ))}
  </View>
));
