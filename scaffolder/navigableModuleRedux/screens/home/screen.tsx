import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { NavBarAction, navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

import { setFruitAction } from '../../actions';
import { {{moduleName | toCamelCase | capitalize}}NavigationParams, {{moduleName | toCamelCase}}RouteNames } from '../../navigation';
import { getFruit } from '../../reducer';
import styles from './styles';
import type { {{moduleName | toCamelCase | capitalize}}HomeScreenDispatchProps, {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, typeof {{moduleName | toCamelCase}}RouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('{{moduleName}}-home-title'),
  // @scaffolder add nav options here if necessary
  headerLeft: () => ( // @scaffolder remove this example
    <NavBarAction
      iconName="ui-filter"
      onPress={() => {
        navigation.navigate({{moduleName | toCamelCase}}RouteNames.other, {}); // @scaffolder, second argument must be defined unless navParams for this screen are typed undefined.
      }}
    />
  ),
});

function {{moduleName | toCamelCase | capitalize}}HomeScreen(props: {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps) {
  return (
    <PageView>
      <BodyBoldText>{{moduleName | toCamelCase}} Home</BodyBoldText>
    </PageView>
  );
}

export default connect(
  (state: IGlobalState) => {
    return {
      fruit: getFruit(state),
    };
  },
  dispatch =>
    bindActionCreators(
      {
        handleChangeFruit: tryAction(setFruitAction, undefined) as unknown as {{moduleName | toCamelCase | capitalize}}HomeScreenDispatchProps['handleChangeFruit'], // TS for react-redux still sux at this moment.
      },
      dispatch,
    ),
)({{moduleName | toCamelCase | capitalize}}HomeScreen);
