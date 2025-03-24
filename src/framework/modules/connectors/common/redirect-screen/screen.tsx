import * as React from 'react';
import { Linking, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { ConnectorNavigationParams, ConnectorRedirectScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import Toast from '~/framework/components/toast';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ConnectorNavigationParams, 'home'>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
});

function ConnectorRedirectScreen(props: ConnectorRedirectScreenPrivateProps) {
  const redirect = async () => {
    const { appUrl, url } = props.route.params;

    // Try redirecting to third party application if appUrl is specified
    if (appUrl) {
      try {
        const isAppInstalled = await Linking.canOpenURL(appUrl);
        if (isAppInstalled) {
          openUrl(appUrl, {
            message: I18n.get('linking-redirectapp-message'),
            title: I18n.get('linking-redirectapp-title'),
          });
          return;
        }
      } catch {
        /* empty */
      }
    }

    if (url) {
      openUrl(`/auth/redirect?url=${encodeURIComponent(url)}`);
    } else {
      Toast.showError(I18n.get('auth-change-mobile-error-text'));
    }
  };

  redirect();
  props.navigation.goBack();
  return <View />;
}

export default ConnectorRedirectScreen;
