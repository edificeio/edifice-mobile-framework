import * as React from 'react';

import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import type { AuthLoginCredentialsScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import {
  consumeAuthErrorAction,
  loginCredentialsActionAddAnotherAccount,
  loginCredentialsActionReplaceAccount,
} from '~/framework/modules/auth/actions';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getAccountsNumber, getState as getAuthState } from '~/framework/modules/auth/reducer';
import LoginCredentialsScreen from '~/framework/modules/auth/templates/login-credentials';
import { LoginCredentialsScreenDispatchProps } from '~/framework/modules/auth/templates/login-credentials/types';
import track from '~/framework/modules/auth/tracking';
import { navBarOptions } from '~/framework/navigation/navBar';
import { handleAction, tryAction } from '~/framework/util/redux/actions';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.loginCredentials>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    backButtonTestID: 'login-back',
    navigation,
    route,
    title: I18n.get('auth-login-title'),
    titleTestID: 'login-title',
  }),
});

function AuthLoginCredentialsScreen(props: AuthLoginCredentialsScreenPrivateProps) {
  return (
    <LoginCredentialsScreen
      {...props}
      forgotPasswordRoute={(login?: string) =>
        CommonActions.navigate({
          name: authRouteNames.addAccountForgot,
          params: { login, mode: 'password', platform: props.route.params.platform },
        })
      }
      forgotIdRoute={CommonActions.navigate({
        name: authRouteNames.addAccountForgot,
        params: { mode: 'id', platform: props.route.params.platform },
      })}
    />
  );
}
export default connect(
  (state: IGlobalState) => {
    return {
      error: getAuthState(state).error,
      lockLogin: getAccountsNumber() > 1,
    };
  },
  dispatch =>
    bindActionCreators<LoginCredentialsScreenDispatchProps>(
      {
        handleConsumeError: handleAction(consumeAuthErrorAction),

        tryLoginAdd: tryAction(
          tryAction(loginCredentialsActionAddAnotherAccount, {
            track: track.loginCredentials,
          }),
          { track: track.addAccount },
        ),
        // Usually, tryLoginReplace is useless in this case.
        // ToDo : fix it like in wayfscreen
        tryLoginReplace: tryAction(
          tryAction(loginCredentialsActionReplaceAccount, {
            track: track.loginCredentials,
          }),
          { track: track.addAccount },
        ),
      },
      dispatch,
    ),
)(AuthLoginCredentialsScreen);
