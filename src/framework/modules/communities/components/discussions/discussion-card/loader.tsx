import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { AVATAR_LOADER_SIZE, styles } from './styles';

const AVATARS_COUNT = 3;
const SUBTITLE_WIDTH = 50;
const TITLE_WIDTH = 70;

const avatars = Array.from({ length: AVATARS_COUNT }, (_, index) => index);

export const DiscussionCardLoader = () => (
  <Placeholder Animation={Fade} style={styles.cardDefault}>
    <View style={styles.loaderContent}>
      <View style={styles.topRow}>
        <PlaceholderMedia style={styles.loaderIconSquare} />
        <View style={styles.content}>
          <PlaceholderLine noMargin style={styles.loaderTitle} width={TITLE_WIDTH} />
          <PlaceholderLine noMargin style={styles.loaderSubtitle} width={SUBTITLE_WIDTH} />
        </View>
      </View>
      <View style={styles.bottomRow}>
        <PlaceholderMedia style={styles.loaderStatus} />
        <View style={styles.loaderAvatarStack}>
          {avatars.map(index => (
            <View key={index} style={styles.loaderAvatar}>
              <PlaceholderMedia isRound size={AVATAR_LOADER_SIZE} />
            </View>
          ))}
        </View>
      </View>
    </View>
  </Placeholder>
);

export default DiscussionCardLoader;
