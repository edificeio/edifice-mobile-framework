import * as React from 'react';
import { View } from 'react-native';

import { PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

const PostDetailsLoader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.authorContainer}>
        <PlaceholderMedia isRound />
        <PlaceholderLine noMargin style={styles.authorName} />
      </View>
      <View style={styles.textContentContainer}>
        <PlaceholderLine noMargin style={styles.textContentLineLong} />
        <PlaceholderLine noMargin style={styles.textContentLineShort} />
      </View>
      <View style={styles.mediaContainer}>
        <PlaceholderMedia style={styles.mediaTile} />
        <PlaceholderMedia style={styles.mediaTile} />
        <PlaceholderMedia style={styles.mediaTile} />
        <PlaceholderMedia style={styles.mediaTile} />
      </View>
      <PlaceholderLine noMargin style={styles.audienceButton} />
      {/* For next version : options button for community action*/}
      {/* <PlaceholderLine noMargin style={styles.optionsButton} /> */}
    </View>
  );
};
export default PostDetailsLoader;
