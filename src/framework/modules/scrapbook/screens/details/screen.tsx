import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import Orientation, { OrientationType, PORTRAIT, useDeviceOrientationChange } from 'react-native-orientation-locker';
import WebView from 'react-native-webview';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { UI_SIZES, genericHitSlop } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import navBarActionStyles from '~/framework/components/navigation/navbar-action/styles';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';
import { ContentLoader } from '~/framework/hooks/loader';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { ScrapbookNavigationParams, scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';
import { scrapbookService } from '~/framework/modules/scrapbook/service';
import { navBarOptions } from '~/framework/navigation/navBar';
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
    title: 'test',
  }),
  headerStyle: { backgroundColor: theme.ui.background.card.toString() },
  headerTitleStyle: { color: theme.ui.text.regular.toString() },
  headerShadowVisible: false,
  headerRight: props => (
    <TouchableOpacity
      onPress={navigation.goBack}
      hitSlop={genericHitSlop}
      style={[
        navBarActionStyles.navBarActionWrapper,
        navBarActionStyles.navBarActionWrapperIcon,
        { backgroundColor: theme.palette.grey.cloudy, borderRadius: UI_SIZES.elements.navbarButtonSize / 2 },
      ]}>
      <NamedSVG
        name="ui-close"
        fill={theme.ui.text.regular}
        width={UI_SIZES.elements.navbarIconSize}
        height={UI_SIZES.elements.navbarIconSize}
        style={navBarActionStyles.navBarActionIcon}
      />
    </TouchableOpacity>
  ),
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

  React.useEffect(() => {
    const newResourceUri = props.route.params.notification.resource.uri.replace('scrapbook', 'scrapbook?fullscreen=1');
    const urlScrapbook = `${props.session?.platform.url + newResourceUri}`;
    getQueryParamToken(urlScrapbook).then(setUrl);
  }, [props.route.params.notification.resource.uri, props.session?.platform.url]);

  const onError = React.useCallback(event => {
    console.error('WebView error: ', event.nativeEvent);
  }, []);

  const onHttpError = React.useCallback(event => {
    console.error('WebView http error: ', event.nativeEvent);
  }, []);

  const init = async () => {
    const uri = props.route.params.notification.resource.uri;
    const id = uri.replace('/scrapbook#/view-scrapbook/', '');
    await scrapbookService.get(id);
  };

  const webviewRef = React.useRef<WebView>(null);

  const onShouldStartLoadWithRequest = React.useCallback(request => {
    return true;
  }, []);

  React.useEffect(() => {
    Orientation.unlockAllOrientations();
    return () => {
      Orientation.lockToPortrait();
    };
  }, []);

  const renderLoading = React.useCallback(() => <Loading />, []);
  const urlObject = React.useMemo(() => (url ? { uri: url } : undefined), [url]);

  const [orientation, setOrientation] = React.useState(PORTRAIT);
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

  const setOrientationToLandscape = () => {
    Orientation.lockToLandscapeRight();
    setOrientation('LANDSCAPE-RIGHT');
  };

  const webviewStyle = React.useMemo(() => [styles.webview], []);

  const player = () => (
    <>
      <WebView
        javaScriptEnabled
        onError={onError}
        onHttpError={onHttpError}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        renderLoading={renderLoading}
        scalesPageToFit
        showsHorizontalScrollIndicator={false}
        source={urlObject}
        setSupportMultipleWindows={false}
        startInLoadingState
        style={webviewStyle}
        ref={webviewRef}
      />
      {orientation === 'PORTRAIT' ? (
        <SecondaryButton style={styles.button} text="Mode paysage" iconRight="ui-arrowRight" action={setOrientationToLandscape} />
      ) : null}
    </>
  );

  return (
    <PageView>
      <ContentLoader
        loadContent={init}
        renderContent={player}
        renderError={() => <EmptyContentScreen />}
        renderLoading={() => <SmallBoldText>load</SmallBoldText>}
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
