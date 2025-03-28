import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

//import styles from './styles';
import type { NabookHomeScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { NabookNavigationParams, nabookRouteNames } from '~/framework/modules/nabook/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<NabookNavigationParams, typeof nabookRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('nabook-home-title'),
  }),
});

export default function NabookHomeScreen(props: NabookHomeScreenPrivateProps) {
  return (
    <PageView>
      <BodyBoldText>nabook home screen</BodyBoldText>
    </PageView>
  );
}
