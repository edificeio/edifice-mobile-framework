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
import { getFruit, getNbUpdates } from '../../reducer';
import styles from './styles';
import type { {{moduleName | toCamelCase | capitalize}}OtherScreenDispatchProps, {{moduleName | toCamelCase | capitalize}}OtherScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, typeof {{moduleName | toCamelCase}}RouteNames.other>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('{{moduleName}}-other-title'),
  headerLeft: () => (
    <NavBarAction
      iconName="ui-plus"
    />
  ),
});

const fruits = ['Pineapple', 'Banana', 'Apple', 'Daemon fruit', 'Coconut', 'Cherry'];

function {{moduleName | toCamelCase | capitalize}}OtherScreen(props: {{moduleName | toCamelCase | capitalize}}OtherScreenPrivateProps) {
  const { navigation, route, handleChangeFruit } = props;
  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <NavBarAction
          iconName="ui-plus"
          onPress={() => {
            handleChangeFruit(fruits[Math.floor(Math.random() * fruits.length)]);
          }}
        />
      ),
    });
  }, [navigation, handleChangeFruit]);
  
  return (
    <PageView>
      <BodyBoldText>{{moduleName | toCamelCase}} Other</BodyBoldText>
      <BodyBoldText>{props.fruit} {props.counter}</BodyBoldText>
    </PageView>
  );
}

export default connect(
  (state: IGlobalState) => {
    return {
      fruit: getFruit(state),
      counter: getNbUpdates(state),
    };
  },
  dispatch =>
    bindActionCreators(
      {
        handleChangeFruit: tryAction(setFruitAction, undefined) as unknown as {{moduleName | toCamelCase | capitalize}}OtherScreenDispatchProps['handleChangeFruit'], // TS for react-redux still sux at this moment.
      },
      dispatch,
    ),
)({{moduleName | toCamelCase | capitalize}}OtherScreen);
