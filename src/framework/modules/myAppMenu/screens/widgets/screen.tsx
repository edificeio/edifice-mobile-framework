import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MyAppMenuWidgetsScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { IMyAppsNavigationParams, myAppsRouteNames } from '~/framework/modules/myAppMenu/navigation';
import CantineHomeScreen from '~/framework/modules/widgets/cantine/screens/home';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IMyAppsNavigationParams, typeof myAppsRouteNames.widgets>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('myapp-widgets-title'),
  }),
});

export default function MyAppMenuWidgetsScreen(props: MyAppMenuWidgetsScreenPrivateProps) {
  return (
    <PageView>
      <ScrollView bottomInset={false}>
        {props.widgetsList.find(widget => widget.config.name === 'cantine') && <CantineHomeScreen />}
      </ScrollView>
    </PageView>
  );
}
