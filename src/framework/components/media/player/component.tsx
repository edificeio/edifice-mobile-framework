import { useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { BackHandler, StatusBar, TouchableOpacity, View } from 'react-native';
import VideoPlayer from 'react-native-media-console';
import Orientation, { PORTRAIT, useDeviceOrientationChange } from 'react-native-orientation-locker';
import WebView from 'react-native-webview';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyMediaNotSupportedScreen } from '~/framework/components/emptyMediaNotSupported';
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
      title: I18n.t('media-player-title'),
    }),
    headerTransparent: true,
    headerStyle: { backgroundColor: theme.palette.primary.regular.toString() },
    headerShown: true,
  };
}

export function computeHiddenNavBar({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.MediaPlayer>): NativeStackNavigationOptions {
  return {
    headerShown: false,
  };
}

function MediaPlayer(props: MediaPlayerProps) {
  const { route, navigation, connected } = props;
  const { source, type, filetype } = route.params;

  const isAudio = type === MediaType.AUDIO;
  const isChangingOrientation = React.useRef(false);

  const [orientation, setOrientation] = React.useState(PORTRAIT);
  const isPortrait = React.useMemo(() => orientation === PORTRAIT, [orientation]);
  useDeviceOrientationChange(newOrientation => {
    const isPortraitOrLandscape =
      newOrientation === 'LANDSCAPE-RIGHT' || newOrientation === 'LANDSCAPE-LEFT' || newOrientation === 'PORTRAIT';
    if (isPortraitOrLandscape && newOrientation !== orientation) {
      isChangingOrientation.current = true;
      setOrientation(newOrientation);
    }
  });

  const [videoPlayerControlTimeoutDelay, setVideoPlayerControlTimeoutDelay] = React.useState(isAudio ? 999999 : 3000);

  const [error, setError] = React.useState<string | undefined>(undefined);
  const navigationHidden = React.useRef<boolean | undefined>(undefined);

  const hideNavigation = React.useCallback(() => {
    if (navigationHidden.current !== true) {
      StatusBar.setHidden(true);
      navigation.setOptions({
        ...computeHiddenNavBar({ navigation, route }),
      });
    }
    navigationHidden.current = true;
  }, [navigation, route]);

  const showNavigation = React.useCallback(() => {
    if (navigationHidden.current !== false) {
      StatusBar.setHidden(false);
      navigation.setOptions({
        ...computeNavBar({ navigation, route }),
      });
    }
    navigationHidden.current = false;
  }, [navigation, route]);

  const handleBack = React.useCallback(() => {
    if (navigationHidden.current !== false) StatusBar.setHidden(false);
    navigationHidden.current = false;
    setTimeout(() => {
      navigation.goBack();
    }, 10);
  }, [navigation]);

  // Force show statusbar when quit the screen. This prevent a bug when close the screen when lansdcape orientation.
  React.useEffect(() => {
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const setErrorMediaType = React.useCallback(() => {
    if (filetype === 'video/avi' || filetype === 'video/x-msvideo') {
      setError('AVFoundationErrorDomain');
      showNavigation();
      return false;
    }
    return true;
  }, [filetype, showNavigation]);

  React.useEffect(() => {
    if (!connected) {
      setError('connection');
      showNavigation();
    } else {
      setError(undefined);
      if (setErrorMediaType()) {
        setTimeout(() => hideNavigation());
      }
    }
  }, [hideNavigation, connected, setErrorMediaType, showNavigation]);

  const handleHardwareBack = React.useCallback(() => {
    handleBack();
    return true;
  }, [handleBack]);

  const handleVideoPlayerEnd = React.useCallback(() => {
    setVideoPlayerControlTimeoutDelay(999999);
  }, []);

  const renderError = () => {
    switch (error) {
      case undefined:
        return null;
      case 'connection':
        return <EmptyConnectionScreen />;
      case 'AVFoundationErrorDomain':
        return <EmptyMediaNotSupportedScreen />;
      default:
        return <EmptyContentScreen />;
    }
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

  const onError = React.useCallback(
    (e: any) => {
      setError(e.error.domain);
      showNavigation();
    },
    [showNavigation],
  );

  const player = React.useMemo(() => {
    if (type === MediaType.WEB)
      return (
        <>
          <View style={[styles.back, isPortrait ? styles.overlayPortrait : styles.overlayLandscape]}>
            <TouchableOpacity onPress={handleBack}>
              <NamedSVG height={24} width={24} name="ui-close" fill={theme.palette.grey.white} />
            </TouchableOpacity>
          </View>
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
            ignoreSilentSwitch="ignore"
            onBack={handleBack}
            onEnd={handleVideoPlayerEnd}
            onError={onError}
            rewindTime={10}
            showDuration
            showOnStart
            showOnEnd
            source={realSource}
            videoStyle={isPortrait ? styles.playerPortrait : styles.playerLandscape}
          />
        </>
      );
  }, [type, isPortrait, handleBack, realSource, isAudio, videoPlayerControlTimeoutDelay, handleVideoPlayerEnd, onError]);

  // Manage orientation
  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (isFocused && !isAudio) Orientation.unlockAllOrientations();
    return () => {
      if (isChangingOrientation.current) Orientation.lockToPortrait();
    };
  }, [isAudio, isFocused]);

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
        height: orientation === PORTRAIT ? UI_SIZES.screen.height : UI_SIZES.screen.width,
      },
    ],
    [orientation],
  );

  return (
    <PageView style={wrapperStyle} showNetworkBar={false}>
      {!error ? player : renderError()}
    </PageView>
  );
}

export default connect((state: any) => ({
  connected: !!state.connectionTracker.connected,
}))(MediaPlayer);
