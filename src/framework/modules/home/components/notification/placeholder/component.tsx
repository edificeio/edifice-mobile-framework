import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import blockStyles from '~/framework/modules/home/components/styles';

import { AVATAR_SIZE, PREVIEW_ICON_SIZE } from '../constants';
import { PLACEHOLDER_CARDS } from './constants';
import styles from './styles';

const preview = (
  <View style={[blockStyles.block, styles.preview]}>
    <View style={blockStyles.blockHeader}>
      <PlaceholderMedia size={PREVIEW_ICON_SIZE} style={styles.previewIcon} />
      <PlaceholderLine width={70} style={styles.previewName} />
    </View>
    <View style={blockStyles.blockBody}>
      <PlaceholderLine style={styles.previewLine} />
      <PlaceholderLine width={60} style={styles.previewLine} />
      <View style={styles.media}>
        <PlaceholderMedia style={styles.mediaItem} />
        <PlaceholderMedia style={styles.mediaItem} />
      </View>
    </View>
  </View>
);

const NotificationPlaceholder = React.memo(({ withPreview }: { withPreview?: boolean }) => {
  const date = <PlaceholderLine width={20} style={styles.date} />;

  return (
    <Placeholder style={styles.card} Animation={Fade}>
      <View style={styles.header}>
        <PlaceholderMedia size={AVATAR_SIZE} isRound style={styles.avatar} />
        <View style={styles.message}>
          <View>
            <PlaceholderLine style={styles.line} />
            {!withPreview ? <PlaceholderLine width={60} style={styles.lastLine} /> : null}
          </View>
          {withPreview ? null : <PlaceholderLine width={30} style={styles.chip} />}
          {withPreview ? null : date}
        </View>
      </View>
      {withPreview ? preview : null}
      {withPreview ? date : null}
    </Placeholder>
  );
});

export const NotificationsPlaceholder = React.memo(
  ({ count = PLACEHOLDER_CARDS, preview: showPreview }: { count?: number; preview?: boolean }) => (
    <View>
      {Array.from({ length: count }, (_unused, index) => (
        <NotificationPlaceholder key={index} withPreview={showPreview && index % 2 === 1} />
      ))}
    </View>
  ),
);
