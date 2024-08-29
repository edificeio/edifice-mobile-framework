import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import NetworkLogger from 'react-native-network-logger';

import { PageView } from '~/framework/components/page';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { DebugScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.debug>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: 'Debug',
  }),
});

function DebugScreen(props: DebugScreenPrivateProps) {
  return (
    <PageView style={styles.page}>
      <NetworkLogger maxRows={20} theme="light" />
    </PageView>
  );
}

export default DebugScreen;
