import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import type { CollaborativewallHomeScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { CollaborativewallNavigationParams, collaborativewallRouteNames } from '~/framework/modules/collaborativewall/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<
  CollaborativewallNavigationParams,
  typeof collaborativewallRouteNames.home
>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('collaborativewall-home-title'),
  }),
});

export default function CollaborativewallHomeScreen(props: CollaborativewallHomeScreenPrivateProps) {
  return (
    <PageView>
      <BodyBoldText>collaborativewall home screen</BodyBoldText>
    </PageView>
  );
}
