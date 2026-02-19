import * as React from 'react';
import { AppState, BackHandler, Platform, StatusBar, View } from 'react-native';

import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import ANIMATION_AUDIO from 'ASSETS/animations/audio/disque.json';
import LottieView from 'lottie-react-native';
import { getBundleId } from 'react-native-device-info';
import VideoPlayer, { VideoPlayerProps } from 'react-native-media-console';
import Orientation, { OrientationType, PORTRAIT, useDeviceOrientationChange } from 'react-native-orientation-locker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewProps } from 'react-native-webview';
import { connect } from 'react-redux';

import styles from './styles';
import { MediaPlayerEmbeddedParams, MediaPlayerPlayableParams, MediaPlayerProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { EmptyScreen } from '~/framework/components/empty-screens';
import FakeHeaderMedia from '~/framework/components/media/fake-header';
import { PageView } from '~/framework/components/page';
import { markViewAudience } from '~/framework/modules/audience';
import { getSession } from '~/framework/modules/auth/reducer';
import { MediaType } from '~/framework/util/media';
import { sessionURISource } from '~/framework/util/transport';

const ERRORS_I18N = {
  'AVFoundationErrorDomain': ['mediaplayer-error-notsupported-title', 'mediaplayer-error-notsupported-text'],
  'connection': ['mediaplayer-error-connection-title', 'mediaplayer-error-connection-text'],
  'default': ['mediaplayer-error-content-title', 'mediaplayer-error-content-text'],
  'ExoPlaybackException: ERROR_CODE_PARSING_CONTAINER_UNSUPPORTED': [
    'mediaplayer-error-notsupported-title',
    'mediaplayer-error-notsupported-text',
  ],
};

const DELAY_STATUS_HIDE = Platform.select({ default: 0, ios: 250 });

function MediaPlayer(props: MediaPlayerProps) {
  const { connected, navigation, route, session } = props;

  const { filetype, source: _source, type } = route.params;

  const source = React.useMemo(
    () =>
      type === MediaType.EMBEDDED
        ? sessionURISource({
            ..._source,
            headers: {
              ...(_source.headers as Record<string, string>),
              'Referer': session?.platform.url ?? getBundleId(),
              'Referrer-Policy': 'strict-origin-when-cross-origin',
            },
          })
        : sessionURISource(_source),
    [_source, session?.platform.url, type],
  );

  const animationRef = React.useRef<LottieView>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);

  const [orientation, setOrientation] = React.useState(PORTRAIT);

  const isPortrait = React.useMemo(() => orientation === PORTRAIT, [orientation]);

  // Manage orientation

  const handleOrientationChange = React.useCallback(
    (newOrientation: OrientationType) => {
      const isPortraitOrLandscape = newOrientation.startsWith('LANDSCAPE') || newOrientation === PORTRAIT;
      if (isPortraitOrLandscape && newOrientation !== orientation) {
        setOrientation(newOrientation);
      }
    },
    [orientation],
  );

  useDeviceOrientationChange(handleOrientationChange);

  const isFocused = useIsFocused();

  React.useEffect(() => {
    // Unlock and handle orientation if needed
    if (isFocused && type !== MediaType.AUDIO) {
      Orientation.unlockAllOrientations();
      setTimeout(() => {
        Orientation.getDeviceOrientation(handleOrientationChange);
      });
    }
    // Lock to portrait when released
    return () => {
      Orientation.lockToPortrait();
    };
  }, [type, isFocused, handleOrientationChange]);

  const [videoPlayerControlTimeoutDelay, setVideoPlayerControlTimeoutDelay] = React.useState(3000);

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

  const onPlayerError = React.useCallback<NonNullable<VideoPlayerProps['onError']>>(({ error: eventError }) => {
    console.error('[Media Player] Error |', JSON.stringify(eventError));
    setError((eventError.domain ?? eventError.errorString) || 'default');
  }, []);

  const onWebViewError = React.useCallback<NonNullable<WebViewProps['onError']>>(({ nativeEvent }) => {
    console.error('[WebView Player] Error |', JSON.stringify(nativeEvent));
    setError(nativeEvent.title || 'default');
  }, []);

  const onHttpError = React.useCallback<NonNullable<WebViewProps['onHttpError']>>(({ nativeEvent }) => {
    console.error('[WebView Player] HTTP Error |', JSON.stringify(nativeEvent));
    setError(nativeEvent.title || 'default');
  }, []);

  const onLoad = React.useCallback(() => {
    isLoadingRef.current = false;
  }, []);

  const onPlay = React.useCallback(() => {
    setIsPlaying(true);
    animationRef.current?.resume();
  }, []);

  const onPause = React.useCallback(() => {
    setIsPlaying(false);
    animationRef.current?.pause();
  }, []);

  const player = React.useMemo(() => {
    if (type === MediaType.EMBEDDED)
      return (
        <>
          <FakeHeaderMedia />
          <WebView
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
            source={source as MediaPlayerEmbeddedParams['source']}
            startInLoadingState
            style={isPortrait ? [styles.playerPortrait, styles.externalPlayerPortrait] : [styles.playerLandscape]}
            webviewDebuggingEnabled={__DEV__}
            onHttpError={onHttpError}
            onError={onWebViewError}
          />
        </>
      );
    else {
      navigation.setOptions({ headerLeft: () => <View /> });
      return (
        <VideoPlayer
          controlTimeoutDelay={videoPlayerControlTimeoutDelay}
          disableFullscreen
          disableVolume
          ignoreSilentSwitch="ignore"
          onBack={handleBack}
          onEnd={handleVideoPlayerEnd}
          onError={onPlayerError}
          onLoad={onLoad}
          onPause={onPause}
          onPlay={onPlay}
          rewindTime={10}
          showDuration
          showOnStart
          showOnEnd
          source={source as MediaPlayerPlayableParams['source']}
          videoStyle={isPortrait ? styles.playerPortrait : styles.playerLandscape}
          {...(type === MediaType.AUDIO
            ? {
                posterElement: <LottieView ref={animationRef} source={ANIMATION_AUDIO} style={styles.poster} speed={0.5} />,
              }
            : {})}
        />
      );
    }
  }, [
    type,
    source,
    isPortrait,
    onHttpError,
    onWebViewError,
    navigation,
    videoPlayerControlTimeoutDelay,
    handleBack,
    handleVideoPlayerEnd,
    onPlayerError,
    onLoad,
    onPause,
    onPlay,
  ]);

  // Manage Lottie after passed app in background
  React.useEffect(() => {
    if (type === MediaType.AUDIO) {
      const subscription = AppState.addEventListener('change', event => {
        if (event === 'active' && isPlaying) animationRef.current?.resume();
      });
      return () => subscription.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Manage Android back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => {
      backHandler.remove();
    };
  }, [handleHardwareBack]);

  const { bottom } = useSafeAreaInsets();

  // force page to be 100% height of the screen
  const wrapperStyle = React.useMemo(
    () => [
      styles.page,
      {
        paddingBottom: Platform.OS === 'android' ? bottom : undefined,
      },
    ],
    [bottom],
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

  // Audience hook
  useFocusEffect(
    React.useCallback(() => {
      if (route.params.referer) {
        markViewAudience(route.params.referer);
      }
    }, [route.params.referer]),
  );

  return (
    <PageView style={wrapperStyle} showNetworkBar={false}>
      <StatusBar animated hidden={hideStatusBar ?? false} />
      {!error ? player : renderError()}
    </PageView>
  );
}

export default connect((state: any) => ({
  connected: !!state.connectionTracker.connected,
  session: getSession(),
}))(MediaPlayer);
