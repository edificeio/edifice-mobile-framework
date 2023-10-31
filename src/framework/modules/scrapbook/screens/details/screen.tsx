import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import Orientation, { OrientationType, PORTRAIT, useDeviceOrientationChange } from 'react-native-orientation-locker';
import WebView from 'react-native-webview';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
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
  const [isLockedToLandscape, setIsLockedToLandscape] = React.useState(false);

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
      if (!reqUrl.startsWith(pfUrl)) openUrl(reqUrl);
      return true;
    },
    [props.session?.platform.url],
  );

  const setOrientationToLandscape = () => {
    Orientation.lockToLandscapeRight();
    setIsLockedToLandscape(true);
    setOrientation('LANDSCAPE-RIGHT');
  };

  const goBack = React.useCallback(() => {
    Orientation.lockToPortrait();
    props.navigation.goBack();
  }, [props.navigation]);

  const handleOrientationChange = React.useCallback(
    (newOrientation: OrientationType) => {
      const isPortraitOrLandscape =
        newOrientation === 'LANDSCAPE-RIGHT' || newOrientation === 'LANDSCAPE-LEFT' || newOrientation === 'PORTRAIT';
      if (isLockedToLandscape && newOrientation === 'PORTRAIT') {
        Orientation.unlockAllOrientations();
        setIsLockedToLandscape(false);
      }
      if (isPortraitOrLandscape && newOrientation !== orientation) {
        setOrientation(newOrientation);
      }
    },
    [isLockedToLandscape, orientation],
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

      {orientation === 'PORTRAIT' && !isLockedToLandscape ? (
        <>
          <IconButton
            action={goBack}
            icon="ui-close"
            color={theme.palette.grey.black}
            size={UI_SIZES.elements.icon.default}
            style={styles.closeButton}
          />
          <SecondaryButton
            style={styles.button}
            text={I18n.get('scrapbook-details-landscape')}
            iconRight="ui-arrowRight"
            action={setOrientationToLandscape}
          />
        </>
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
