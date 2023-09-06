import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { ActionButton } from '~/framework/components/buttons/action';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { addValueAction } from '~/framework/modules/{{moduleName}}/actions';
import { {{moduleName | toCamelCase | capitalize}}NavigationParams, {{moduleName | toCamelCase}}RouteNames } from '~/framework/modules/{{moduleName}}/navigation';
import { getState } from '~/framework/modules/{{moduleName}}/reducer';
import { navBarOptions } from '~/framework/navigation/navBar';
import { handleAction, tryAction } from '~/framework/util/redux/actions';

import styles from './styles';
import type { {{moduleName | toCamelCase | capitalize}}HomeScreenDispatchProps, {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps, {{moduleName | toCamelCase | capitalize}}HomeScreenStoreProps } from './types';

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

function {{moduleName | toCamelCase | capitalize}}HomeScreen(props: {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps) {
  const { handleAddValue, tryAddValue, basicValue } = props;

  const addValue = React.useCallback(() => {
    handleAddValue(); // no need to try/catch a action called with handleAction()

    try {
      tryAddValue(); // need to try/catch a action called with tryAction()
    } catch {
      // ...
    }
  }, [handleAddValue, tryAddValue]);

  return (
    <PageView>
      <BodyBoldText>{{moduleName | toCamelCase}} home screen</BodyBoldText>
      <ActionButton text={basicValue.toString()} action={addValue} />
    </PageView>
  );
}

export default connect(
  (state: IGlobalState): {{moduleName | toCamelCase | capitalize}}HomeScreenStoreProps => {
    return {
      basicValue: getState(state).basicValue,
    };
  },
  dispatch =>
    bindActionCreators<{{moduleName | toCamelCase | capitalize}}HomeScreenDispatchProps>(
      {
        handleAddValue: handleAction(addValueAction, undefined),
        tryAddValue: tryAction(addValueAction, undefined),
      },
      dispatch,
    ),
)({{moduleName | toCamelCase | capitalize}}HomeScreen);
