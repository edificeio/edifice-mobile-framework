import * as React from 'react';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import RNConfigReader from 'react-native-config-reader';
import DeviceInfo from 'react-native-device-info';

import styles from './styles';

import { PageView } from '~/framework/components/page';
import { SmallBoldText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';

export function infosNavBar({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Infos>): NativeStackNavigationOptions {
  return {
    ...navBarOptions({
      navigation,
      route,
      title: 'App Infos',
    }),
  };
}

export function InfosScreen() {
  const infos = {
    buildNumber: DeviceInfo.getBuildNumber(),
    buildType: RNConfigReader.BundleVersionType,
    deviceModel: DeviceInfo.getModel(),
    os: DeviceInfo.getSystemName(),
    osVersion: DeviceInfo.getSystemVersion(),
    override: RNConfigReader.BundleVersionOverride,
    version: DeviceInfo.getVersion(),
  };
  const session = getSession();
  return (
    <PageView style={styles.page}>
      <SmallBoldText style={styles.version}>{`Version : ${infos.version}-${infos.buildType} (${infos.buildNumber})`}</SmallBoldText>
      <SmallBoldText style={styles.version}>{`Platform : ${session?.platform?.displayName}`}</SmallBoldText>
      <SmallBoldText style={styles.version}>{`Override : ${infos.override}`}</SmallBoldText>
      <SmallBoldText style={styles.version}>{`Device : ${infos.deviceModel} - ${infos.os} ${infos.osVersion}`}</SmallBoldText>
    </PageView>
  );
}
