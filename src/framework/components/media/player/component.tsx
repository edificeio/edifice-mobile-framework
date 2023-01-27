import I18n from 'i18n-js';
import * as React from 'react';
import { StatusBar } from 'react-native';
import VideoPlayer from 'react-native-media-console';
import Orientation, { LANDSCAPE, PORTRAIT, useOrientationChange } from 'react-native-orientation-locker';
import WebView from 'react-native-webview';

import ActionButton from '~/framework/components/buttons/action';
import { PageView } from '~/framework/components/page';

import styles from './styles';
import { MediaPlayerProps, MediaType } from './types';

export default function MediaPlayer(props: MediaPlayerProps) {
  const source = props.navigation.getParam('source');
  const type = props.navigation.getParam('type');

  const [orientation, setOrientation] = React.useState(PORTRAIT);
  const [vpControlTimeoutDelay, setVPControlTimeoutDelay] = React.useState(type === MediaType.AUDIO ? undefined : 3000);

  React.useEffect(() => {
    Orientation.unlockAllOrientations();
    StatusBar.setHidden(true);
  });

  useOrientationChange(current => {
    if (current.indexOf(LANDSCAPE) > -1) setOrientation(LANDSCAPE);
    else if (current.indexOf(PORTRAIT) > -1) setOrientation(PORTRAIT);
  });

  const onBack = () => {
    Orientation.lockToPortrait();
    StatusBar.setHidden(false);
    props.navigation.goBack();
  };

  const onVPEnd = () => {
    setVPControlTimeoutDelay(undefined);
  };

  const getPlayer = () => {
    if (type !== MediaType.WEB)
      return (
        <VideoPlayer
          controlTimeoutDelay={vpControlTimeoutDelay}
          disableFullscreen
          disableVolume
          ignoreSilentSwitch="ignore"
          showOnStart
          showOnEnd
          source={source}
          onBack={onBack}
          onEnd={onVPEnd}
        />
      );

    return (
      <>
        <WebView
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={false}
          source={source}
          startInLoadingState
          style={orientation === LANDSCAPE ? styles.playerLandscape : styles.playerPortrait}
        />
        <ActionButton style={styles.backButton} text={I18n.t('back')} action={onBack} />
      </>
    );
  };

  return (
    <PageView style={styles.page} showNetworkBar={false}>
      {getPlayer()}
    </PageView>
  );
}
