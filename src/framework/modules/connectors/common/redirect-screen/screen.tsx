import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';

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
  const { url } = props.route.params;

  if (url) {
    openUrl(`/auth/redirect?url=${url}`);
  } else {
    Toast.showError(I18n.t('common.error.text'));
  }
  props.navigation.goBack();
  return <View />;
}

export default ConnectorRedirectScreen;
