import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MyAppMenuWidgetsScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { BodyBoldText } from '~/framework/components/text';
import { MyAppMenuNavigationParams, myAppMenuRouteNames } from '~/framework/modules/myAppMenu/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MyAppMenuNavigationParams, typeof myAppMenuRouteNames.widgets>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('myAppMenu-widgets-title'),
  }),
});

export default function MyAppMenuWidgetsScreen(props: MyAppMenuWidgetsScreenPrivateProps) {
  return (
    <PageView>
      <ScrollView bottomInset={false}>
        <BodyBoldText>myAppMenu widgets screen</BodyBoldText>
      </ScrollView>
    </PageView>
  );
}
