import CookieManager from '@react-native-cookies/cookies';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { BackHandler, Platform, StatusBar, View } from 'react-native';
import Orientation, {
  LANDSCAPE_LEFT,
  OrientationType,
  PORTRAIT,
  useDeviceOrientationChange,
} from 'react-native-orientation-locker';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen, EmptyContentScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import WebView from '~/framework/components/webview';
import { useConstructor } from '~/framework/hooks/constructor';
import { ContentLoader } from '~/framework/hooks/loader';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { ScrapbookNavigationParams, scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';
import { scrapbookService } from '~/framework/modules/scrapbook/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';
import { urlSigner } from '~/infra/oauth';
import { Loading } from '~/ui/Loading';

import styles from './styles';
import { ScrapbookDetailsScreenDataProps, ScrapbookDetailsScreenEventProps, ScrapbookDetailsScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ScrapbookNavigationParams, typeof scrapbookRouteNames.details>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  headerShown: false,
});

const getQueryParamToken = async (finalUrl: string) => {
  try {
    const session = assertSession();
    if (urlSigner.getIsUrlSignable(finalUrl)) {
      const customToken = await session.oauth2.getQueryParamToken();
      if (customToken && finalUrl) {
        // Token can have failed to load. In that case, just ignore it and go on. The user may need to login on the web.
        const urlObj = new URL(finalUrl);
        urlObj.searchParams.append('queryparam_token', customToken);
        return urlObj.href;
      }
      return finalUrl;
    } else return finalUrl;
  } catch {
    // Do nothing. We just don't have customToken.
    return finalUrl;
  }
};

const ScrapbookDetailsScreen = (props: ScrapbookDetailsScreenProps) => {
  const [autorotateEnabled, setIsAutorotateEnabled] = React.useState(true);

  const [error, setError] = React.useState(false);

  const [isLocked, setIsLocked] = React.useState(false);

  const [orientation, setOrientation] = React.useState(PORTRAIT);

  const [url, setUrl] = React.useState<string | undefined>(undefined);

  const urlObject = React.useMemo(() => (url ? { uri: url } : undefined), [url]);

  const webviewRef = React.useRef<WebView>(null);

  const goBack = React.useCallback(() => {
    Orientation.lockToPortrait();
    props.navigation.goBack();
    return true;
  }, [props.navigation]);

  const init = async () => {
    const uri = props.route.params.resourceUri;
    const id = uri.replace('/scrapbook#/view-scrapbook/', '');
    await scrapbookService.get(id);
  };

  const onError = React.useCallback(event => {
    setError(true);
  }, []);

  const onHttpError = React.useCallback(event => {
    setError(true);
  }, []);

  const onShouldStartLoadWithRequest = React.useCallback(
    request => {
      const pfUrl = props.session?.platform.url;
      const reqUrl = request.url;
      if (
        !reqUrl.startsWith(pfUrl) &&
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
    [props.session?.platform.url],
  );

  const setLockedOrientation = () => {
    if (orientation !== PORTRAIT) {
      Orientation.lockToPortrait();
      setOrientation(PORTRAIT);
    } else {
      Orientation.lockToLandscapeLeft();
      setOrientation(LANDSCAPE_LEFT);
    }
    setIsLocked(true);
  };

  // Check Android orientation lock and lock to portrait if needed
  useConstructor(() => {
    if (Platform.OS === 'android') {
      Orientation.getAutoRotateState(state => {
        if (!state) Orientation.lockToPortrait();
        setIsAutorotateEnabled(state);
      });
    }
  });

  // Manage Orientation

  const handleOrientationChange = React.useCallback(
    (newOrientation: OrientationType) => {
      if (autorotateEnabled) {
        const isPortraitOrLandscape = newOrientation.startsWith('LANDSCAPE') || newOrientation === PORTRAIT;
        if (isLocked && orientation !== PORTRAIT && newOrientation === PORTRAIT) {
          Orientation.unlockAllOrientations();
          setIsLocked(false);
        }
        if (isLocked && orientation === PORTRAIT && newOrientation !== PORTRAIT) {
          Orientation.unlockAllOrientations();
          setIsLocked(false);
        }
        if (isPortraitOrLandscape && newOrientation !== orientation) {
          setOrientation(newOrientation);
        }
      }
    },
    [autorotateEnabled, isLocked, orientation],
  );

  useDeviceOrientationChange(handleOrientationChange);

  React.useEffect(() => {
    if (autorotateEnabled) Orientation.unlockAllOrientations();
  }, [autorotateEnabled]);

  React.useEffect(() => {
    CookieManager.clearAll(true);
    if (autorotateEnabled) Orientation.unlockAllOrientations();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => backHandler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const newResourceUri = props.route.params.resourceUri.replace('scrapbook', 'scrapbook?fullscreen=1');
    const urlScrapbook = `${props.session?.platform.url + newResourceUri}`;
    getQueryParamToken(urlScrapbook).then(setUrl);
  }, [props.route.params.resourceUri, props.session?.platform.url]);

  const renderLoading = React.useCallback(() => <Loading />, []);

  const renderPlayer = () => (
    <PageView>
      <StatusBar animated hidden />
      <WebView
        javaScriptEnabled
        ref={webviewRef}
        renderLoading={renderLoading}
        scalesPageToFit
        setSupportMultipleWindows={false}
        showsHorizontalScrollIndicator={false}
        source={urlObject}
        startInLoadingState
        style={styles.webview}
        onError={onError}
        onHttpError={onHttpError}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      />
      {autorotateEnabled ? (
        <IconButton
          style={styles.button}
          icon={orientation === PORTRAIT ? 'ui-fullScreen' : 'ui-closeFullScreen'}
          action={setLockedOrientation}
          color={theme.palette.grey.black}
          size={UI_SIZES.elements.icon.small}
        />
      ) : null}
      {orientation === PORTRAIT ? (
        <IconButton
          action={goBack}
          icon="ui-close"
          color={theme.palette.grey.black}
          size={UI_SIZES.elements.icon.default}
          style={styles.closeButton}
        />
      ) : null}
    </PageView>
  );

  const renderError = () => {
    Orientation.lockToPortrait();
    return (
      <>
        <View style={{ height: props.route.params.headerHeight, backgroundColor: theme.ui.background.page }} />
        {error ? <EmptyConnectionScreen /> : <EmptyContentScreen />}
        <IconButton
          action={goBack}
          icon="ui-close"
          color={theme.palette.grey.black}
          size={UI_SIZES.elements.icon.default}
          style={styles.closeButton}
        />
      </>
    );
  };

  return (
    <ContentLoader
      loadContent={init}
      renderContent={error ? renderError : renderPlayer}
      renderError={renderError}
      renderLoading={renderLoading}
    />
  );
};

const mapStateToProps: (s: IGlobalState) => ScrapbookDetailsScreenDataProps = s => ({
  session: getSession(),
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => ScrapbookDetailsScreenEventProps = (dispatch, getState) => ({});

const ScrapbookDetailsScreenConnected = connect(mapStateToProps, mapDispatchToProps)(ScrapbookDetailsScreen);
export default ScrapbookDetailsScreenConnected;
