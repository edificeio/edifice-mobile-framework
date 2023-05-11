import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { BackHandler, Platform, StatusBar, TouchableOpacity, View } from 'react-native';
import VideoPlayer from 'react-native-media-console';
import Orientation, { OrientationType, PORTRAIT, useDeviceOrientationChange } from 'react-native-orientation-locker';
import WebView from 'react-native-webview';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import { MediaPlayerProps, MediaType } from './types';

export function computeNavBar({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.MediaPlayer>): NativeStackNavigationOptions {
  return {
    ...navBarOptions({
      navigation,
      route,
      title: '',
    }),
    headerTransparent: true,
    headerStyle: { backgroundColor: 'transparent' },
  };
}

const ERRORS_I18N = {
  connection: ['common.error.connection.title', 'common.error.connection.text'],
  AVFoundationErrorDomain: ['common.error.mediaNotSupported.title', 'common.error.mediaNotSupported.text'],
  default: ['common.error.content.title', 'common.error.content.text'],
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
      <EmptyScreen
        customStyle={styles.errorScreen}
        svgImage="image-not-found"
        title={I18n.t(i18nKeys[0])}
        text={I18n.t(i18nKeys[1])}
        svgFillColor={theme.palette.grey.fog}
        textColor={theme.palette.grey.fog}
      />
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
          <View style={[styles.back, isPortrait ? styles.overlayPortrait : styles.overlayLandscape]} />
          <WebView
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
            source={realSource}
            startInLoadingState
            style={isPortrait ? styles.playerPortrait : styles.playerLandscape}
          />
        </>
      );
    else
      return (
        <>
          <VideoPlayer
            alwaysShowControls={isAudio}
            controlTimeoutDelay={videoPlayerControlTimeoutDelay}
            disableFullscreen
            disableVolume
            disableBack
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
          />
        </>
      );
  }, [type, isPortrait, handleBack, realSource, isAudio, videoPlayerControlTimeoutDelay, handleVideoPlayerEnd, onError, onLoad]);

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
