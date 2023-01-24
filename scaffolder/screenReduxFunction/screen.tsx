import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { navBarOptions } from '~/framework/navigation/navBar';

import { {{moduleName | toCamelCase | capitalize}}NavigationParams, {{moduleName | toCamelCase}}RouteNames } from '../../navigation';
import styles from './styles';
import type {
  {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenDispatchProps,
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
  }),
  title: I18n.t('{{moduleName}}-{{screenName}}-title'),
});

function {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen(props: {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenPrivateProps) {
  return (
    <PageView>
      <BodyBoldText>{{moduleName | toCamelCase}} {{screenName | toCamelCase}} screen</BodyBoldText>
    </PageView>
  );
}

export default connect(
  (state: IGlobalState) => {
    return {
      // @scaffolder add storeProps here.
    };
  },
  dispatch =>
    bindActionCreators(
      {
        // @scaffolder add dispatchProps here. Name must start with 'handle'.
      },
      dispatch,
    ),
)({{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen);
