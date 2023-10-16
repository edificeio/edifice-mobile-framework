import * as React from 'react';
import { View } from 'react-native';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

export default function UserPlaceholderProfile() {
  const renderBloc = lineWidth => {
    return (
      <View style={styles.bloc}>
        <PlaceholderLine width={34} style={styles.h24} />
        <View style={[styles.lineIconText, styles.mb12]}>
          <PlaceholderMedia style={styles.icon} size={28} />
          <PlaceholderLine width={lineWidth} style={[styles.mb0, styles.h20]} />
        </View>
        <View style={styles.lineIconText}>
          <PlaceholderMedia style={styles.icon} size={28} />
          <PlaceholderLine width={lineWidth} style={[styles.mb0, styles.h20]} />
        </View>
      </View>
    );
  };
  const renderMedia = () => {
    return (
      <View style={styles.bloc}>
        <PlaceholderLine width={34} style={styles.h24} />
        <PlaceholderMedia style={styles.table} />
      </View>
    );
  };
  return (
    <Placeholder style={styles.page} Animation={Fade}>
      <View style={styles.topContent}>
        <PlaceholderMedia style={styles.avatar} size={88} />
        <Placeholder>
          <PlaceholderLine width={54} style={[styles.mb0, styles.h24]} />
          <PlaceholderLine width={28} style={[styles.mb0, styles.h18, styles.textMiddle]} />
          <PlaceholderLine width={38} style={[styles.mb0, styles.h24]} />
        </Placeholder>
      </View>
      {renderBloc(78)}
      {renderBloc(66)}
      {renderMedia()}
      {renderBloc(64)}
    </Placeholder>
  );
}
