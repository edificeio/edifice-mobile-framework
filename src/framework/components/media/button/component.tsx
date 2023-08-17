/**
 * Player (audio/video)
 */
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES, getScaleHeight, getScaleImageSize } from '~/framework/components/constants';
import MediaIcon from '~/framework/components/media/icon';
import { MediaType, openMediaPlayer } from '~/framework/components/media/player';
import { NamedSVG } from '~/framework/components/picture';
import { SmallItalicText } from '~/framework/components/text';
import { Image } from '~/framework/util/media';
import { urlSigner } from '~/infra/oauth';

import styles from './styles';
import { IPlayerProps } from './types';

class MediaButton extends React.Component<IPlayerProps> {
  showMediaPlayer() {
    openMediaPlayer({
      type: this.props.type as MediaType,
      source: urlSigner.signURISource(this.props.source),
    });
  }

  iconSizeAudio = getScaleImageSize(20);

  iconSizeVideo = getScaleImageSize(24);

  widthWaves = UI_SIZES.screen.width - 4 * UI_SIZES.spacing.medium - getScaleHeight(36) - 3 * UI_SIZES.spacing.small;

  heightWaves = Math.round(this.widthWaves * (36 / 237));

  public render() {
    const { type, source, ratio, posterSource, style } = this.props;
    const isAudio = type === 'audio';
    const isVideoOrWebview = type === 'video' || type === 'web';

    // styles depends props
    const playerStyle = {
      aspectRatio: ratio || 16 / 10,
    };

    const getPreviewVideo = () => {
      return !source || !type ? (
        <SmallItalicText>{I18n.get(`mediabutton-${type || 'media'}-notavailable`)}</SmallItalicText>
      ) : (
        <TouchableOpacity onPress={() => this.showMediaPlayer()} style={[styles.previewVideo, style]}>
          {type === 'web' ? (
            <WebView source={source} style={[playerStyle, styles.player]} />
          ) : (
            <Image source={posterSource || {}} style={[playerStyle, styles.player]} resizeMode="contain" />
          )}
          <View style={styles.viewVideo}>
            <MediaIcon icon="ui-play-filled" iconSize={this.iconSizeVideo} />
          </View>
        </TouchableOpacity>
      );
    };

    const getPreviewAudio = () => {
      return (
        <TouchableOpacity onPress={() => this.showMediaPlayer()}>
          <View style={styles.previewAudio}>
            <MediaIcon icon="ui-play-filled" iconSize={this.iconSizeAudio} style={styles.iconAudio} />
            <NamedSVG width={this.widthWaves} height={this.heightWaves} fill={theme.palette.primary.light} name="ui-wavering" />
          </View>
        </TouchableOpacity>
      );
    };

    return <>{isVideoOrWebview ? getPreviewVideo() : isAudio ? getPreviewAudio() : null}</>;
  }
}

export default MediaButton;
