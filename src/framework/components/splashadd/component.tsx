import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import WebView from '~/framework/components/webview';
import { navigate } from '~/framework/navigation/helper';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';
import { urlSigner } from '~/infra/oauth';

import styles from './styles';
import { SplashaddScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, typeof ModalsRouteNames.SplashAdd>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
});

const SplashaddScreen = (props: SplashaddScreenProps) => {
  const { route } = props;
  const source = route.params.resourceUri;

  return (
    <WebView
      javaScriptEnabled
      scalesPageToFit
      setSupportMultipleWindows={false}
      showsHorizontalScrollIndicator={false}
      source={{ uri: urlSigner.getAbsoluteUrl(source)! }}
      startInLoadingState
      style={styles.splashadd}
      webviewDebuggingEnabled={__DEV__}
    />
  );
};

export default SplashaddScreen;

export function openSplashaddScreen(navParams: IModalsNavigationParams[ModalsRouteNames.SplashAdd]) {
  navigate(ModalsRouteNames.SplashAdd, navParams);
}
