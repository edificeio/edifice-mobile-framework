import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { BackHandler, Platform, StatusBar, View } from 'react-native';
import VideoPlayer from 'react-native-media-console';
import Orientation, { OrientationType, PORTRAIT, useDeviceOrientationChange } from 'react-native-orientation-locker';
import WebView from 'react-native-webview';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FakeHeaderMedia from '~/framework/components/media/fake-header';
import { PageView } from '~/framework/components/page';

import styles from './styles';
import { MediaPlayerProps, MediaType } from './types';
import { useHeaderHeight } from '@react-navigation/elements';

const ERRORS_I18N = {
  connection: ['mediaplayer-error-connection-title', 'mediaplayer-error-connection-text'],
  AVFoundationErrorDomain: ['mediaplayer-error-notsupported-title', 'mediaplayer-error-notsupported-text'],
  default: ['mediaplayer-error-content-title', 'mediaplayer-error-content-text'],
};
const DELAY_STATUS_HIDE = Platform.select({ ios: 250, default: 0 });

function MediaPlayer(props: MediaPlayerProps) {
  const { route, navigation, connected } = props;
  const { source, type, filetype } = route.params;

  const isAudio = type === MediaType.AUDIO;

  const [orientation, setOrientation] = React.useState(PORTRAIT);
  const isPortrait = React.useMemo(() => orientation === PORTRAIT, [orientation]);
  const handleOrientationChange = React.useCallback(
    (newOrientation: OrientationType) => {
      const isPortraitOrLandscape =
        newOrientation === 'LANDSCAPE-RIGHT' || newOrientation === 'LANDSCAPE-LEFT' || newOrientation === 'PORTRAIT';
      if (isPortraitOrLandscape && newOrientation !== orientation) {
        setOrientation(newOrientation);
      }
    },
    [orientation],
  );
  useDeviceOrientationChange(handleOrientationChange);

  // Manage orientation
  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (isFocused && !isAudio) Orientation.unlockAllOrientations();
    setTimeout(() => {
      Orientation.getDeviceOrientation(handleOrientationChange);
    });
    return () => {
      Orientation.lockToPortrait();
    };
  }, [handleOrientationChange, isAudio, isFocused]);

  const [videoPlayerControlTimeoutDelay, setVideoPlayerControlTimeoutDelay] = React.useState(isAudio ? 999999 : 3000);

  const [error, setError] = React.useState<string | undefined>(undefined);
  const navigationHidden = React.useRef<boolean | undefined>(undefined);
  const isLoadingRef = React.useRef<boolean>(true);
  const headerHeight = useHeaderHeight();

  const handleBack = React.useCallback(() => {
    navigationHidden.current = false;
    setTimeout(() => {
      navigation.goBack();
    }, 10);
  }, [navigation]);

  const setErrorMediaType = React.useCallback(() => {
    if (filetype === 'video/avi' || filetype === 'video/x-msvideo') {
      setError('AVFoundationErrorDomain');
      return false;
    }
    return true;
  }, [filetype]);

  React.useEffect(() => {
    if (!connected) {
      setError('connection');
    } else {
      setError(undefined);
      setErrorMediaType();
    }
  }, [connected, setErrorMediaType]);

  const handleHardwareBack = React.useCallback(() => {
    handleBack();
    return true;
  }, [handleBack]);

  const handleVideoPlayerEnd = React.useCallback(() => {
    setVideoPlayerControlTimeoutDelay(999999);
  }, []);

  const renderError = () => {
    const i18nKeys = ERRORS_I18N[error ?? 'default'] ?? ERRORS_I18N.default;
    return (
      <>
        <FakeHeaderMedia />
        <EmptyScreen
          customStyle={styles.errorScreen}
          svgImage="image-not-found"
          title={I18n.get(i18nKeys[0])}
          text={I18n.get(i18nKeys[1])}
          svgFillColor={theme.palette.grey.fog}
          textColor={theme.palette.grey.fog}
        />
      </>
    );
  };

  const realSource = React.useMemo(() => {
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
  }, [source]);

  const onError = React.useCallback((e: any) => {
    setError(e.error.domain);
  }, []);

  const onLoad = React.useCallback(() => {
    isLoadingRef.current = false;
  }, []);

  const player = React.useMemo(() => {
    if (type === MediaType.WEB)
      return (
        <>
          <FakeHeaderMedia />
          <WebView
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
            source={realSource}
            startInLoadingState
            style={isPortrait ? [styles.playerPortrait, styles.externalPlayerPortrait] : [styles.playerLandscape]}
          />
        </>
      );
    else {
      // eslint-disable-next-line react/no-unstable-nested-components
      navigation.setOptions({ headerLeft: () => <View /> });
      return (
        <VideoPlayer
          alwaysShowControls={isAudio}
          controlTimeoutDelay={videoPlayerControlTimeoutDelay}
          disableFullscreen
          disableVolume
          ignoreSilentSwitch="ignore"
          onBack={handleBack}
          onEnd={handleVideoPlayerEnd}
          onError={onError}
          onLoad={onLoad}
          rewindTime={10}
          showDuration
          showOnStart
          showOnEnd
          source={realSource}
          videoStyle={isPortrait ? styles.playerPortrait : styles.playerLandscape}
          topControlsStyle={Platform.OS === 'android' ? { paddingTop: headerHeight } : {}}
        />
      );
    }
  }, [
    type,
    isPortrait,
    realSource,
    navigation,
    isAudio,
    videoPlayerControlTimeoutDelay,
    handleBack,
    handleVideoPlayerEnd,
    onError,
    onLoad,
  ]);

  // Manage Android back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => {
      backHandler.remove();
    };
  }, [handleHardwareBack]);

  // force page to be 100% height of the screen
  const wrapperStyle = React.useMemo(
    () => [
      styles.page,
      {
        height: isPortrait ? UI_SIZES.screen.height : UI_SIZES.screen.width,
      },
    ],
    [isPortrait],
  );

  const [hideStatusBar, setHideStatusBar] = React.useState<boolean | undefined>(undefined);
  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        setHideStatusBar(!error);
      }, DELAY_STATUS_HIDE);
    }, [error]),
  );
  React.useEffect(() => {
    if (hideStatusBar !== undefined) setHideStatusBar(!error);
  }, [error, hideStatusBar]);

  return (
    <PageView style={wrapperStyle} showNetworkBar={false}>
      <StatusBar animated hidden={hideStatusBar ?? false} />
      {!error ? player : renderError()}
    </PageView>
  );
}

export default connect((state: any) => ({
  connected: !!state.connectionTracker.connected,
}))(MediaPlayer);
