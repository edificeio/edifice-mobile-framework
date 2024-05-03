import CookieManager from '@react-native-cookies/cookies';
import { ParamListBase, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { StatusBar, View } from 'react-native';
import Orientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  OrientationLocker,
  OrientationLockerProps,
  OrientationType,
  PORTRAIT,
} from 'react-native-orientation-locker';
import { OnShouldStartLoadWithRequest, WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';
import { connect } from 'react-redux';

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
import { getCurrentQueryParamToken, getPlatform } from '~/framework/modules/auth/reducer';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';
import { OAuth2RessourceOwnerPasswordClient, urlSigner } from '~/infra/oauth';

import styles from './styles';
import { WebResourceViewerPrivateProps, WebResourceViewerStoreProps } from './types';

export const computeNavBar = ({ navigation, route }: NativeStackScreenProps<ParamListBase>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  headerShown: false,
  presentation: 'fullScreenModal',
});

const renderLoading = () => <LoadingIndicator />;
const truePromiseFn = async () => true;

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

const WebviewResourceViewer = (props: WebResourceViewerPrivateProps & Required<WebResourceViewerStoreProps>) => {
  const { navigation, platform, source, fetchResource, queryParamToken, injectSearchParams = {} } = props;
  const sourceObject: WebViewSourceUri = React.useMemo(() => {
    let uri = typeof source === 'string' ? urlSigner.getAbsoluteUrl(source)! : urlSigner.getAbsoluteUrl(source.uri)!;
    const uriObj = new URL(uri);
    if (queryParamToken) {
      uriObj.searchParams.append('queryparam_token', queryParamToken.value);
    }
    uriObj.searchParams.append('xApp', 'mobile');
    for (const searchParam in injectSearchParams) {
      uriObj.searchParams.append(searchParam, injectSearchParams[searchParam]);
    }
    uri = uriObj.href;
    return typeof source === 'string' ? { uri } : { ...source, uri };
  }, [injectSearchParams, queryParamToken, source]);

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
      if (!reqUrl.startsWith(platform.url)) {
        openUrl(reqUrl);
        return false;
      }
      if (
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
    [platform.url],
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
        source={sourceObject}
        startInLoadingState
        style={styles.webview}
        onError={onError}
        onHttpError={onError}
        onLoad={onLoad}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      />
    ),
    [onError, onLoad, onShouldStartLoadWithRequest, sourceObject],
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
        <StatusBar animated hidden />
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

  const loadContent = React.useCallback(async () => {
    if (!fetchResource) return truePromiseFn();
    if (urlSigner.getIsUrlSignable(sourceObject.uri)) {
      await OAuth2RessourceOwnerPasswordClient.connection?.getQueryParamToken();
    }
    return fetchResource();
  }, [fetchResource, sourceObject.uri]);

  return (
    <ContentLoader loadContent={loadContent} renderContent={webviewError ? renderEmpty : renderContent} renderError={renderEmpty} />
  );
};

export const EnsurePlatformDefinedComponent = (props: WebResourceViewerPrivateProps) => {
  return props.platform ? (
    <WebviewResourceViewer {...(props as WebResourceViewerPrivateProps & Required<WebResourceViewerStoreProps>)} />
  ) : (
    <EmptyContentScreen />
  );
};

export default connect((state: IGlobalState) => ({
  platform: getPlatform(),
  queryParamToken: getCurrentQueryParamToken(),
}))(EnsurePlatformDefinedComponent);
