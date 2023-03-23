import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { navBarOptions } from '~/framework/navigation/navBar';

import { AuthRouteNames, IAuthNavigationParams } from '../../navigation';
import styles from './styles';
import type { AuthChangeMobileScreenDispatchProps, AuthChangeMobileScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.changeMobile>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('auth-change-mobile-title'),
});

function AuthChangeMobileScreen(props: AuthChangeMobileScreenPrivateProps) {
  return (
    <PageView>
      <BodyBoldText>auth changeMobile screen</BodyBoldText>
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
)(AuthChangeMobileScreen);
