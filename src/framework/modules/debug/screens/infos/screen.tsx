import * as React from 'react';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { PageView } from '~/framework/components/page';
import { SmallBoldText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';
import { fullVersionLabel, versionDetails } from '~/framework/util/app-info';

import styles from './styles';

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
  const session = getSession();
  return (
    <PageView style={styles.page}>
      <SmallBoldText style={styles.version}>{`Version : ${fullVersionLabel}`}</SmallBoldText>
      <SmallBoldText style={styles.version}>
        {`Platform : ${session?.platform?.displayName ?? session?.platform?.name}`}
      </SmallBoldText>
      <SmallBoldText style={styles.version}>{`Override : ${versionDetails.override}`}</SmallBoldText>
      <SmallBoldText
        style={
          styles.version
        }>{`Device : ${versionDetails.deviceModel} - ${versionDetails.os} ${versionDetails.osVersion}`}</SmallBoldText>
    </PageView>
  );
}
