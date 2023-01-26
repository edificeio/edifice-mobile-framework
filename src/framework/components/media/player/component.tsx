import I18n from 'i18n-js';
import * as React from 'react';
import { StatusBar } from 'react-native';
import VideoPlayer from 'react-native-media-console';
import Orientation from 'react-native-orientation-locker';
import WebView from 'react-native-webview';

import ActionButton from '~/framework/components/buttons/action';
import { PageView } from '~/framework/components/page';

import styles from './styles';
import { MediaPlayerProps, MediaType } from './types';

export default function MediaPlayer(props: MediaPlayerProps) {
  const source = props.navigation.getParam('source');
  const isAudio = props.navigation.getParam('type') === MediaType.AUDIO;
  const isWebView = props.navigation.getParam('type') === MediaType.WEB;
  const [controlTimeoutDelay, setControlTimeoutDelay] = React.useState(isAudio ? undefined : 3000);

  React.useEffect(() => {
    Orientation.unlockAllOrientations();
    StatusBar.setHidden(true);
  });

  const onBack = () => {
    Orientation.lockToPortrait();
    StatusBar.setHidden(false);
    props.navigation.goBack();
  };

  const onEnd = () => {
    setControlTimeoutDelay(undefined);
  };

  return (
    <PageView style={styles.page} showNetworkBar={false}>
      {isWebView ? (
        <>
          <WebView
            {...props}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
            source={source}
            startInLoadingState
          />
          <ActionButton style={styles.backButtonWebview} text={I18n.t('back')} action={onBack} />
        </>
      ) : (
        <VideoPlayer
          controlTimeoutDelay={controlTimeoutDelay}
          disableFullscreen
          showOnStart
          showOnEnd
          source={source}
          onBack={onBack}
          onEnd={onEnd}
          ignoreSilentSwitch="ignore"
          disableVolume
        />
      )}
    </PageView>
  );
}
