import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { ICON_BIG_SIZE } from '~/framework/modules/communities/components/discussions/header/styles';

import styles from './styles';

const TITLE_SECOND_LINE_WIDTH = 50;
const AUTHOR_WIDTH = 80;
const DATE_WIDTH = 30;

export const DiscussionHeaderLoader = () => (
  <Placeholder Animation={Fade} style={styles.loaderRoot}>
    <View style={styles.loaderBand}>
      <View style={styles.loaderTitleLines}>
        <PlaceholderLine noMargin style={styles.loaderTitle} />
        <PlaceholderLine noMargin style={styles.loaderTitle} width={TITLE_SECOND_LINE_WIDTH} />
      </View>
      <PlaceholderMedia size={ICON_BIG_SIZE} style={styles.loaderIcon} />
      <View style={styles.loaderAuthorAndDateColumn}>
        <View style={styles.loaderAuthorLineBox}>
          <PlaceholderLine noMargin style={styles.loaderAuthor} width={AUTHOR_WIDTH} />
        </View>
        <View style={styles.loaderDateLineBox}>
          <PlaceholderLine noMargin style={styles.loaderDate} width={DATE_WIDTH} />
        </View>
      </View>
    </View>
  </Placeholder>
);

export default DiscussionHeaderLoader;
