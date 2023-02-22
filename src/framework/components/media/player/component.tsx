import I18n from 'i18n-js';
import * as React from 'react';
import { StatusBar, TouchableOpacity, View } from 'react-native';
import VideoPlayer from 'react-native-media-console';
import Orientation, { LANDSCAPE, PORTRAIT, useOrientationChange } from 'react-native-orientation-locker';
import WebView from 'react-native-webview';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';

import styles from './styles';
import { MediaPlayerProps, MediaType } from './types';

function MediaPlayer(props: MediaPlayerProps) {
  let source = props.navigation.getParam('source');
  const type = props.navigation.getParam('type');
  const [error, setError] = React.useState(false);

  // Add "file://" if absolute url is provided
  if (typeof source === 'string') {
    if (!source.includes('://')) {
      source = 'file://' + source;
    }
    source = { uri: new URL(source).href };
  } else if (typeof source === 'object') {
    if (!source.uri.includes('://')) {
      source.uri = 'file://' + source;
    }
    source.uri = new URL(source.uri).href;
  }

  const isAudio = type === MediaType.AUDIO;

  const [orientation, setOrientation] = React.useState(PORTRAIT);
  const [vpControlTimeoutDelay, setVPControlTimeoutDelay] = React.useState(isAudio ? 999999 : 3000);

  React.useEffect(() => {
    if (!isAudio) Orientation.unlockAllOrientations();
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

  React.useEffect(() => {
    if (!props.connected) {
      setError(true);
    } else {
      setError(false);
    }
  }, [props.connected]);

  const onVPEnd = () => {
    setVPControlTimeoutDelay(999999);
  };

  const styleOverlay = {
    height: orientation === PORTRAIT ? 80 : 60,
  };

  const getPlayer = () => {
    if (type !== MediaType.WEB)
      return (
        <VideoPlayer
          controlTimeoutDelay={vpControlTimeoutDelay}
          disableFullscreen
          disableVolume
          ignoreSilentSwitch="ignore"
          rewindTime={10}
          showDuration
          showOnStart
          showOnEnd
          source={source}
          onBack={onBack}
          onEnd={onVPEnd}
          onError={() => setError(true)}
          alwaysShowControls={isAudio}
        />
      );

    return (
      <>
        <View style={[styles.back, styleOverlay]}>
          <TouchableOpacity onPress={onBack}>
            <NamedSVG height={24} width={24} name="ui-rafterLeft" fill={theme.palette.grey.white} />
          </TouchableOpacity>
        </View>
        <WebView
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={false}
          source={source}
          startInLoadingState
          style={orientation === LANDSCAPE ? styles.playerLandscape : styles.playerPortrait}
        />
      </>
    );
  };

  return (
    <>
      {!error ? (
        <PageView style={styles.page} showNetworkBar={false}>
          {getPlayer()}
        </PageView>
      ) : (
        <PageView navBarWithBack={{ title: I18n.t('media-player-title') }}>
          <EmptyContentScreen />
        </PageView>
      )}
    </>
  );
}

export default connect((state: any) => ({
  connected: !!state.connectionTracker.connected,
}))(MediaPlayer);
