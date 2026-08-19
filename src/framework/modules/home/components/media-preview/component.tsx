import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { Svg } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';
import { Image } from '~/framework/modules/media/components/image';
import { computeVideoThumbnail } from '~/framework/modules/workspace/service';
import { extractVideoResolution } from '~/framework/util/htmlParser/content';
import { sessionImageSource } from '~/framework/util/transport';

import { PLAY_ICON_SIZE, PREVIEW_MEDIA } from './constants';
import styles from './styles';
import { MediaPreviewProps, PreviewMedia } from './types';

const mediaSource = (media: PreviewMedia) => {
  if (media.type === 'image' && media.src) return sessionImageSource({ uri: media.src as string });
  if (media.type === 'video' && media['document-id']) {
    const resolution = media['video-resolution'] ? extractVideoResolution(media['video-resolution']) : undefined;
    return sessionImageSource({ uri: computeVideoThumbnail(media['document-id'], resolution) });
  }
  return undefined;
};

export const MediaPreview = React.memo(({ media, withVideos }: MediaPreviewProps) => {
  const shownMedia = React.useMemo(
    () =>
      (media as PreviewMedia[]).filter(item => item.type === 'image' || (withVideos && item.type === 'video' && mediaSource(item))),
    [media, withVideos],
  );

  if (!shownMedia.length) return null;

  const remaining = shownMedia.length - PREVIEW_MEDIA;
  const shown = shownMedia.slice(0, remaining > 0 ? PREVIEW_MEDIA + 1 : PREVIEW_MEDIA);

  return (
    <View style={styles.row}>
      {shown.map((item, index) => {
        const source = mediaSource(item);
        const isLast = remaining > 0 && index === PREVIEW_MEDIA;

        return isLast ? (
          <View key={index} style={styles.moreMedia}>
            <Image source={source} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, styles.moreOverlay]} />
            <SmallBoldText style={styles.moreCount}>+{remaining}</SmallBoldText>
          </View>
        ) : (
          <View key={index} style={[styles.media, shown.length === 1 && styles.mediaAlone]}>
            <Image source={source} style={styles.mediaImage} />
            {item.type === 'video' ? (
              <Svg
                name="ui-play-filled"
                fill={styles.playIcon.color}
                width={PLAY_ICON_SIZE}
                height={PLAY_ICON_SIZE}
                style={styles.play}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
});
