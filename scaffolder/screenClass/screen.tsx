import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';

import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { navBarOptions } from '~/framework/navigation/navBar';

import { {{moduleName | toCamelCase | capitalize}}NavigationParams, {{moduleName | toCamelCase}}RouteNames } from '~/framework/modules/module-name/navigation';
import styles from './styles';
import type {
  {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenPrivateProps,
  {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenState,
 } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, typeof {{moduleName | toCamelCase}}RouteNames.{{screenName | toCamelCase}}>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('{{moduleName}}-{{screenName}}-title'),
  }),
});

export default class {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen extends React.PureComponent<{{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenPrivateProps, {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenState> {
  state: {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenState = {
    // @scaffolder add internal state default values here
  };

  render() {
    return (
      <PageView>
        <BodyBoldText>{{moduleName | toCamelCase}} {{screenName | toCamelCase}} screen</BodyBoldText>
      </PageView>
    );
  }
}


