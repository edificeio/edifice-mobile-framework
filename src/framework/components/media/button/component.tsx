/**
 * Player (audio/video)
 */
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { getScaleImageSize } from '~/framework/components/constants';
import MediaIcon from '~/framework/components/media/icon';
import { Svg } from '~/framework/components/picture';
import { SmallItalicText } from '~/framework/components/text';
import { MediaType } from '~/framework/modules/media';
import { Image } from '~/framework/util/media-deprecated';
import { useOpenMedia } from '~/modules/media/hooks';
import type { FileMedia } from '~/modules/media/types';
import { I18n } from '~/util/i18n';

import styles from './styles';
import { IPlayerProps } from './types';

const iconSizeAudio = getScaleImageSize(20);
const iconSizeVideo = getScaleImageSize(24);

const notAvailableMediaText = {
  audio: 'mediabutton-audio-notavailable',
  image: 'mediabutton-image-notavailable',
  media: 'mediabutton-media-notavailable',
  video: 'mediabutton-video-notavailable',
};

const MediaButton = (props: IPlayerProps) => {
  const { onPreviewPress, posterSource, ratio, source, style, type } = props;

  const isAudio = type === MediaType.AUDIO;
  const isVideoOrWebview = type === MediaType.VIDEO || type === MediaType.EMBEDDED;

  const playerStyle = {
    aspectRatio: ratio || 16 / 10,
  };

  const { openCarousel } = useOpenMedia();

  // The carousel plays the medias, and signs their source.
  const showMediaPlayer = () => {
    openCarousel({ media: [{ mime: 'application/octet-stream', src: source, type } as FileMedia] });
  };

  const getPreviewVideo = () => {
    return !source || !type ? (
      <SmallItalicText>{I18n.get(notAvailableMediaText[type || 'media'])}</SmallItalicText>
    ) : (
      <TouchableOpacity
        onPress={() => (onPreviewPress ? onPreviewPress() : showMediaPlayer())}
        style={[styles.previewVideo, style]}>
        {posterSource ? <Image source={posterSource || {}} style={[playerStyle, styles.player]} resizeMode="contain" /> : null}
        <View style={styles.viewVideo}>
          <MediaIcon icon="ui-play-filled" iconSize={iconSizeVideo} />
        </View>
      </TouchableOpacity>
    );
  };

  const getPreviewAudio = () => {
    return (
      <TouchableOpacity onPress={() => (onPreviewPress ? onPreviewPress() : showMediaPlayer())}>
        <View style={styles.previewAudio}>
          <MediaIcon icon="ui-play-filled" iconSize={iconSizeAudio} style={styles.iconAudio} />
          <View style={styles.waves}>
            <Svg width="100%" height="100%" fill={theme.palette.primary.light} name="ui-wavering" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return <>{isVideoOrWebview ? getPreviewVideo() : isAudio ? getPreviewAudio() : null}</>;
};

export default MediaButton;
