import * as React from 'react';
import { View } from 'react-native';

import CookieManager from '@preeternal/react-native-cookie-manager';
import { ParamListBase, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import Orientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  OrientationLocker,
  OrientationLockerProps,
  OrientationType,
  PORTRAIT,
} from 'react-native-orientation-locker';
import { OnShouldStartLoadWithRequest } from 'react-native-webview/lib/WebViewTypes';
import { useDispatch, useSelector } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen, EmptyContentScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import WebView from '~/framework/components/webview';
import { useConstructor } from '~/framework/hooks/constructor';
import { ContentLoader } from '~/framework/hooks/loader';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { refreshQueryParamTokenAction } from '~/framework/modules/auth/thunks';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';

import styles from './styles';
import { WebResourceViewerPrivateProps } from './types';

export const computeNavBar = ({ navigation, route }: NativeStackScreenProps<ParamListBase>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  headerShown: false,
  presentation: 'fullScreenModal',
});

const renderLoading = () => <LoadingIndicator />;

const useScreenUnlockOrientation = () => {
  const [orientation, setOrientation] = React.useState<OrientationLockerProps['orientation']>(PORTRAIT);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        Orientation.lockToPortrait();
      };
    }, []),
  );

  const onDeviceOrientationChange = React.useCallback((o: OrientationType) => {
    if (o === OrientationType.PORTRAIT) {
      setOrientation(PORTRAIT);
    } else if (o === OrientationType['LANDSCAPE-LEFT']) {
      setOrientation(LANDSCAPE_LEFT);
    } else if (o === OrientationType['LANDSCAPE-RIGHT']) {
      setOrientation(LANDSCAPE_RIGHT);
    } else {
      // do not change orientation.
    }
  }, []);

  const orientationElement = <OrientationLocker orientation={orientation} onDeviceChange={onDeviceOrientationChange} />;

  const toggleOrientation = React.useCallback(() => {
    if (orientation !== PORTRAIT) {
      setOrientation(PORTRAIT);
    } else {
      setOrientation(LANDSCAPE_LEFT);
    }
  }, [orientation]);
  return [orientationElement, orientation, toggleOrientation] as const;
};

export default function WebviewResourceViewer({ fetchResource, navigation, source: _source }: WebResourceViewerPrivateProps) {
  const session = useSelector(selectors.session);
  const sourceOrigin = new URL(_source.uri).origin;
  const dispatch = useDispatch<ThunkDispatch<IGlobalState, never, Action>>();
  const isUrlInternal = session && sourceOrigin === session.platform.url;
  const source = React.useMemo(() => {
    const url = new URL(_source.uri);
    if (isUrlInternal && session.tokens.queryParam) url.searchParams.append('queryparam_token', session.tokens.queryParam.value);
    return { ..._source, uri: url.href };
  }, [_source, isUrlInternal, session?.tokens.queryParam]);

  const checkResourceAvailability = React.useCallback(async () => {
    if (isUrlInternal) {
      await dispatch(refreshQueryParamTokenAction(session));
    }
    return fetchResource?.();
  }, [dispatch, fetchResource, isUrlInternal, session]);

  const [orientationElement, orientation, toggleOrientation] = useScreenUnlockOrientation();

  const [webviewError, setWebviewError] = React.useState(false);
  const onError = React.useCallback(() => setWebviewError(true), []);

  const firstLoadRef = React.useRef(true);
  const onLoad = React.useCallback(() => {
    firstLoadRef.current = false;
  }, []);

  const onShouldStartLoadWithRequest: OnShouldStartLoadWithRequest = React.useCallback(
    request => {
      if (firstLoadRef.current) return true;
      const reqUrl = request.url;

      if (
        !(session && reqUrl.startsWith(session.platform.url)) &&
        !reqUrl.includes('embed') &&
        !reqUrl.includes('imasdk.googleapis.com') &&
        !reqUrl.includes('player.vimeo.com') &&
        !reqUrl.includes('learningapps.org') &&
        reqUrl !== 'about:blank'
      ) {
        openUrl(reqUrl);
        return false;
      }
      return true;
    },
    [session],
  );

  useConstructor(() => {
    CookieManager.clearAll(true);
  });

  const webviewElement = React.useMemo(
    () => (
      <WebView
        javaScriptEnabled
        renderLoading={renderLoading}
        scalesPageToFit
        setSupportMultipleWindows={false}
        showsHorizontalScrollIndicator={false}
        source={source}
        startInLoadingState
        style={styles.webview}
        webviewDebuggingEnabled={__DEV__}
        onError={onError}
        onHttpError={onError}
        onLoad={onLoad}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      />
    ),
    [onError, onLoad, onShouldStartLoadWithRequest, source],
  );

  const closeButton = React.useMemo(
    () => (
      <IconButton
        action={navigation.goBack}
        icon="ui-close"
        color={theme.palette.grey.black}
        size={UI_SIZES.elements.icon.default}
        style={styles.closeButton}
      />
    ),
    [navigation.goBack],
  );

  const renderContent = React.useCallback(
    () => (
      <PageView style={styles.page}>
        {orientationElement}
        {webviewElement}
        <IconButton
          style={styles.button}
          icon={orientation === OrientationType.PORTRAIT ? 'ui-fullScreen' : 'ui-closeFullScreen'}
          action={toggleOrientation}
          color={theme.palette.grey.black}
          size={UI_SIZES.elements.icon.small}
        />
        {orientation === OrientationType.PORTRAIT ? closeButton : null}
      </PageView>
    ),
    [closeButton, orientation, orientationElement, toggleOrientation, webviewElement],
  );

  const renderEmpty = React.useCallback(
    () => (
      <PageView style={styles.page}>
        <OrientationLocker orientation={OrientationType.PORTRAIT} />
        <View style={styles.error}>{webviewError ? <EmptyConnectionScreen /> : <EmptyContentScreen />}</View>
        {closeButton}
      </PageView>
    ),
    [webviewError, closeButton],
  );

  return (
    <ContentLoader
      loadContent={checkResourceAvailability}
      renderContent={webviewError ? renderEmpty : renderContent}
      renderError={renderEmpty}
    />
  );
}
