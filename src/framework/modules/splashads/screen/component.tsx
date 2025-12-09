import * as React from 'react';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import { SplashadsScreenProps } from './types';

import theme from '~/app/theme';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import WebView from '~/framework/components/webview';
import { getSession } from '~/framework/modules/auth/reducer';
import { navigate } from '~/framework/navigation/helper';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';
import { platformURISource } from '~/framework/util/transport';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, typeof ModalsRouteNames.SplashAds>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    backButtonTestID: 'splash-ads-close',
    navigation,
    route,
    title: '',
  }),
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: theme.palette.grey.white,
    elevation: 0,
    shadowOpacity: 0,
  },
});

const SplashadsScreen = (props: SplashadsScreenProps) => {
  const { route } = props;
  const source = route.params.resourceUri;
  const session = getSession();

  const [isTimeout, setIsTimeout] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const firstLoadRef = React.useRef(true);

  const onLoad = React.useCallback(() => {
    firstLoadRef.current = false;
  }, []);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLoaded) {
        setIsTimeout(true);
      }
    }, 20000);

    return () => clearTimeout(timeoutId);
  }, [isLoaded]);

  const onShouldStartLoadWithRequest = React.useCallback(request => {
    if (firstLoadRef.current) return true;

    openUrl(request.url);
    return false;
  }, []);

  const onLoadEnd = () => {
    setIsLoaded(true);
  };

  return isTimeout || !session ? (
    <EmptyContentScreen />
  ) : (
    <WebView
      javaScriptEnabled
      scalesPageToFit
      setSupportMultipleWindows={false}
      showsHorizontalScrollIndicator={false}
      source={platformURISource(session.platform, { uri: source })}
      startInLoadingState
      style={styles.splashads}
      webviewDebuggingEnabled={__DEV__}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      onLoadEnd={onLoadEnd}
      bounces={false}
      onLoad={onLoad}
      incognito
      onHttpError={() => setIsTimeout(true)}
      onError={() => setIsTimeout(true)}
      testID="splash-ads-view"
    />
  );
};

export default SplashadsScreen;

export function showSplashads(navParams: IModalsNavigationParams[ModalsRouteNames.SplashAds]) {
  navigate(ModalsRouteNames.SplashAds, navParams);
}
