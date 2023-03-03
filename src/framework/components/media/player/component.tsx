import I18n from 'i18n-js';
import * as React from 'react';
import { BackHandler, StatusBar, TouchableOpacity, View } from 'react-native';
import VideoPlayer from 'react-native-media-console';
import Orientation, { PORTRAIT, useDeviceOrientationChange } from 'react-native-orientation-locker';
import WebView from 'react-native-webview';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyMediaNotSupportedScreen } from '~/framework/components/emptyMediaNotSupported';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';

import styles from './styles';
import { MediaPlayerProps, MediaType } from './types';

function MediaPlayer(props: MediaPlayerProps) {
  const source = props.navigation.getParam('source');
  const type = props.navigation.getParam('type');

  const isAudio = type === MediaType.AUDIO;
  let isChangingOrientation = false;

  const [error, setError] = React.useState({
    active: false,
    type: '',
  });

  const [orientation, setOrientation] = React.useState(PORTRAIT);
  const [videoPlayerControlTimeoutDelay, setVideoPlayerControlTimeoutDelay] = React.useState(isAudio ? 999999 : 3000);

  const handleBack = () => {
    StatusBar.setHidden(false);
    setTimeout(() => {
      props.navigation.goBack();
    }, 10);
  };

  React.useEffect(() => {
    if (!props.connected) {
      setError({
        active: true,
        type: 'connection',
      });
    } else {
      setError({
        active: false,
        type: '',
      });
    }
  }, [props.connected]);

  const handleHardwareBack = () => {
    handleBack();
    return true;
  };

  const handleVideoPlayerEnd = () => {
    setVideoPlayerControlTimeoutDelay(999999);
  };

  const renderError = () => {
    switch (error.type) {
      case 'connection':
        return <EmptyConnectionScreen />;
      case 'AVFoundationErrorDomain':
        return <EmptyMediaNotSupportedScreen />;
      default:
        return <EmptyContentScreen />;
    }
  };

  const getSource = () => {
    // Add "file://" if absolute url is provided
    let src = Object.assign({}, source);
    if (typeof source === 'string') {
      if (!source.includes('://')) {
        src = `file://${source}`;
      }
      src = { uri: new URL(src).href };
    } else if (typeof source === 'object') {
      if (!source.uri.includes('://')) {
        src.uri = `file://${source}`;
      }
      src.uri = new URL(source.uri).href;
    }
    return src;
  };

  const getPlayer = () => {
    const isPortrait = orientation === PORTRAIT;
    if (type === MediaType.WEB)
      return (
        <>
          <View style={[styles.back, isPortrait ? styles.overlayPortrait : styles.overlayLandscape]}>
            <TouchableOpacity onPress={handleBack}>
              <NamedSVG height={24} width={24} name="ui-rafterLeft" fill={theme.palette.grey.white} />
            </TouchableOpacity>
          </View>
          <WebView
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
            source={getSource()}
            startInLoadingState
            style={isPortrait ? styles.playerPortrait : styles.playerLandscape}
          />
        </>
      );
    return (
      <>
        <VideoPlayer
          alwaysShowControls={isAudio}
          controlTimeoutDelay={videoPlayerControlTimeoutDelay}
          disableFullscreen
          disableVolume
          ignoreSilentSwitch="ignore"
          onBack={handleBack}
          onEnd={handleVideoPlayerEnd}
          onError={(e: any) => {
            setError({
              active: true,
              type: e.error.domain,
            });
          }}
          rewindTime={10}
          showDuration
          showOnStart
          showOnEnd
          source={getSource()}
        />
      </>
    );
  };

  useDeviceOrientationChange(newOrientation => {
    const isPortraitOrLandscape =
      newOrientation === 'LANDSCAPE-RIGHT' || newOrientation === 'LANDSCAPE-LEFT' || newOrientation === 'PORTRAIT';
    if (isPortraitOrLandscape && newOrientation !== orientation) {
      isChangingOrientation = true;
      setOrientation(newOrientation);
    }
  });

  React.useEffect(() => {
    if (!isAudio) Orientation.unlockAllOrientations();
    setTimeout(() => {
      if (!error.active) StatusBar.setHidden(true);
    }, 10);
    // Manage Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => {
      backHandler.remove();
      if (!isChangingOrientation) {
        Orientation.lockToPortrait();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      isChangingOrientation = false;
    };
  });

  return (
    <>
      {!error.active ? (
        <PageView style={styles.page} showNetworkBar={false} onBack={handleBack}>
          {getPlayer()}
        </PageView>
      ) : (
        <PageView navBarWithBack={{ title: I18n.t('media-player-title') }} onBack={handleBack}>
          {renderError()}
        </PageView>
      )}
    </>
  );
}

export default connect((state: any) => ({
  connected: !!state.connectionTracker.connected,
}))(MediaPlayer);
