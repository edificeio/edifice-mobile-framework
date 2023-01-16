/**
 * Player (audio/video)
 */
import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';

import theme from '~/app/theme';
import { getScaleImageSize } from '~/framework/components/constants';
import MediaIcon from '~/framework/components/media/icon';
import { MediaType, openMediaPlayer } from '~/framework/components/media/player';
import { SmallItalicText } from '~/framework/components/text';
import { Image } from '~/framework/util/media';
import { urlSigner } from '~/infra/oauth';

import { NamedSVG } from '../../picture';
import styles from './styles';
import { IPlayerProps } from './types';

class MediaButton extends React.Component<IPlayerProps & NavigationInjectedProps> {
  showMediaPlayer() {
    openMediaPlayer(
      {
        type: this.props.type as MediaType,
        source: urlSigner.signURISource(this.props.source),
      },
      this.props.navigation,
    );
  }

  public render() {
    const { type, source, ratio, posterSource, style } = this.props;
    const isAudio = type === 'audio';
    const isVideoOrWebview = type === 'video' || type === 'web';

    // styles depends props
    const playerStyle = {
      aspectRatio: ratio || 7 / 5,
    };

    const getPreviewVideo = () => {
      return !source || !type ? (
        <SmallItalicText>{I18n.t(`${type || 'media'}NotAvailable`)}</SmallItalicText>
      ) : (
        <TouchableOpacity onPress={() => this.showMediaPlayer()} style={[styles.previewVideo, style]}>
          <Image source={posterSource || {}} style={[playerStyle, styles.player]} resizeMode="contain" />
          <View style={styles.viewVideo}>
            <MediaIcon icon="ui-recordVideo" height={getScaleImageSize(38)} width={getScaleImageSize(38)} />
          </View>
        </TouchableOpacity>
      );
    };

    const getPreviewAudio = () => {
      return (
        <TouchableOpacity onPress={() => this.showMediaPlayer()}>
          <View style={styles.previewAudio}>
            <MediaIcon icon="ui-audio" height={getScaleImageSize(24)} width={getScaleImageSize(24)} style={styles.iconAudio} />
            <NamedSVG fill={theme.palette.complementary.blue.light} name="ui-wavering" />
          </View>
        </TouchableOpacity>
      );
    };

    return <>{isVideoOrWebview ? getPreviewVideo() : isAudio ? getPreviewAudio() : null}</>;
  }
}

export default withNavigation(MediaButton);
