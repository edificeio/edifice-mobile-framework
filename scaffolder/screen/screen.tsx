import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { I18n } from '~/app/i18n';
import * as React from 'react';

import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { navBarOptions } from '~/framework/navigation/navBar';

import { {{moduleName | toCamelCase | capitalize}}NavigationParams, {{moduleName | toCamelCase}}RouteNames } from '~/framework/modules/{{moduleName}}/navigation';
import styles from './styles';
import type { {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, typeof {{moduleName | toCamelCase}}RouteNames.{{screenName | toCamelCase}}>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('{{moduleName}}-{{screenName}}-title'),
  }),
});

export default function {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen(props: {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen.AllProps) {
  return (
    <PageView>
      <BodyBoldText>{{moduleName | toCamelCase}} {{screenName | toCamelCase}} screen</BodyBoldText>
    </PageView>
  );
}
