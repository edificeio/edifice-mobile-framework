import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { {{moduleName | toCamelCase | capitalize}}NavigationParams, {{moduleName | toCamelCase}}RouteNames } from '~/framework/modules/{{moduleName}}/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, typeof {{moduleName | toCamelCase}}RouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('{{moduleName}}-home-title'),
  }),
});

export default function {{moduleName | toCamelCase | capitalize}}HomeScreen(props: {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps) {
  return (
    <PageView>
      <BodyBoldText>{{moduleName | toCamelCase}} home screen</BodyBoldText>
    </PageView>
  );
}
