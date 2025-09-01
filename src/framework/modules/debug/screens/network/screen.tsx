import * as React from 'react';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import NetworkLogger from 'react-native-network-logger';

import styles from './styles';

import { PageView } from '~/framework/components/page';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';

export function networkNavBar({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Network>): NativeStackNavigationOptions {
  return {
    ...navBarOptions({
      navigation,
      route,
      title: 'Network Log',
    }),
  };
}

export function NetworkScreen() {
  return (
    <PageView style={styles.page}>
      <NetworkLogger maxRows={20} theme="light" />
    </PageView>
  );
}
