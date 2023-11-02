import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import Orientation, { OrientationType, PORTRAIT, useDeviceOrientationChange } from 'react-native-orientation-locker';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import WebView from '~/framework/components/webview';
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
  const [url, setUrl] = React.useState<string | undefined>(undefined);
  const [orientation, setOrientation] = React.useState(PORTRAIT);
  const [isLocked, setIsLocked] = React.useState(false);

  const urlObject = React.useMemo(() => (url ? { uri: url } : undefined), [url]);
  const webviewRef = React.useRef<WebView>(null);

  const init = async () => {
    const uri = props.route.params.notification.resource.uri;
    const id = uri.replace('/scrapbook#/view-scrapbook/', '');
    await scrapbookService.get(id);
  };

  const onError = React.useCallback(event => {
    console.error('WebView error: ', event.nativeEvent);
  }, []);

  const onHttpError = React.useCallback(event => {
    console.error('WebView http error: ', event.nativeEvent);
  }, []);

  const onShouldStartLoadWithRequest = React.useCallback(
    request => {
      const pfUrl = props.session?.platform.url;
      const reqUrl = request.url;
      if (!reqUrl.startsWith(pfUrl) && !reqUrl.includes('embed') && reqUrl !== 'about:blank') {
        openUrl(reqUrl);
        return false;
      }
      return true;
    },
    [props.session?.platform.url],
  );

  const setLockedOrientation = () => {
    if (orientation !== 'PORTRAIT') {
      Orientation.lockToPortrait();
      setOrientation('PORTRAIT');
    } else {
      Orientation.lockToLandscapeRight();
      setOrientation('LANDSCAPE-RIGHT');
    }
    setIsLocked(true);
  };

  const goBack = React.useCallback(() => {
    Orientation.lockToPortrait();
    props.navigation.goBack();
  }, [props.navigation]);

  const handleOrientationChange = React.useCallback(
    (newOrientation: OrientationType) => {
      const isPortraitOrLandscape =
        newOrientation === 'LANDSCAPE-RIGHT' || newOrientation === 'LANDSCAPE-LEFT' || newOrientation === 'PORTRAIT';
      if (isLocked && orientation !== 'PORTRAIT' && newOrientation === 'PORTRAIT') {
        Orientation.unlockAllOrientations();
        setIsLocked(false);
      }
      if (isLocked && orientation === 'PORTRAIT' && newOrientation !== 'PORTRAIT') {
        Orientation.unlockAllOrientations();
        setIsLocked(false);
      }
      if (isPortraitOrLandscape && newOrientation !== orientation) {
        setOrientation(newOrientation);
      }
    },
    [isLocked, orientation],
  );

  useDeviceOrientationChange(handleOrientationChange);

  React.useEffect(() => {
    Orientation.unlockAllOrientations();
  }, []);

  React.useEffect(() => {
    const newResourceUri = props.route.params.notification.resource.uri.replace('scrapbook', 'scrapbook?fullscreen=1');
    const urlScrapbook = `${props.session?.platform.url + newResourceUri}`;
    getQueryParamToken(urlScrapbook).then(setUrl);
  }, [props.route.params.notification.resource.uri, props.session?.platform.url]);

  const renderLoading = React.useCallback(() => <Loading />, []);

  const player = () => (
    <>
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
      <IconButton
        style={styles.button}
        icon={orientation === 'PORTRAIT' ? 'ui-fullScreen' : 'ui-closeFullScreen'}
        action={setLockedOrientation}
        color={theme.palette.grey.black}
        size={UI_SIZES.elements.icon.small}
      />
      {orientation === 'PORTRAIT' ? (
        <IconButton
          action={goBack}
          icon="ui-close"
          color={theme.palette.grey.black}
          size={UI_SIZES.elements.icon.default}
          style={styles.closeButton}
        />
      ) : null}
    </>
  );

  return (
    <PageView>
      <ContentLoader
        loadContent={init}
        renderContent={player}
        renderError={() => <EmptyContentScreen />}
        renderLoading={renderLoading}
      />
    </PageView>
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
