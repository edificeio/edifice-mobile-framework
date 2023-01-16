import I18n from 'i18n-js';
import * as React from 'react';
import { StatusBar } from 'react-native';
import VideoPlayer from 'react-native-media-console';
import Orientation from 'react-native-orientation-locker';

import ActionButton from '~/framework/components/buttons/action';
import SafeWebView from '~/framework/components/media/webview';
import { PageView } from '~/framework/components/page';

import styles from './styles';
import { MediaPlayerProps, MediaType } from './types';

export default function MediaPlayer(props: MediaPlayerProps) {
  const source = props.navigation.getParam('source');
  const isAudio = props.navigation.getParam('type') === MediaType.AUDIO;
  const isWebView = props.navigation.getParam('type') === MediaType.WEB;

  React.useEffect(() => {
    Orientation.unlockAllOrientations();
    StatusBar.setHidden(true);
  });

  const onBack = () => {
    Orientation.lockToPortrait();
    StatusBar.setHidden(false);
    props.navigation.goBack();
  };

  return (
    <PageView style={styles.page} showNetworkBar={false}>
      {isWebView ? (
        <>
          <SafeWebView source={source} scrollEnabled={false} startInLoadingState mediaPlaybackRequiresUserAction />
          <ActionButton style={styles.backButtonWebview} text={I18n.t('back')} action={onBack} />
        </>
      ) : (
        <VideoPlayer
          controlTimeoutDelay={30000}
          disableFullscreen
          showOnStart={isAudio}
          source={source}
          onBack={onBack}
          onEnd={onBack}
        />
      )}
    </PageView>
  );
}
