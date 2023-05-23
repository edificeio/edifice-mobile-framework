import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Linking, View } from 'react-native';

import { I18n } from '~/app/i18n';
import Toast from '~/framework/components/toast';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';

import { ConnectorNavigationParams, ConnectorRedirectScreenPrivateProps } from './types';

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
            title: I18n.get('common.redirect.app.title'),
            message: I18n.get('common.redirect.app.message'),
          });
          return;
        }
      } catch {
        /* empty */
      }
    }

    if (url) {
      openUrl(`/auth/redirect?url=${url}`);
    } else {
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  redirect();
  props.navigation.goBack();
  return <View />;
}

export default ConnectorRedirectScreen;
