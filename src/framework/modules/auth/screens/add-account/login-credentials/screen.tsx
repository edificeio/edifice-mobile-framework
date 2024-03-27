import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

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

import type { AuthLoginCredentialsScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.loginCredentials>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-login-title'),
    titleTestID: 'login-title',
    backButtonTestID: 'login-back',
  }),
});

function AuthLoginCredentialsScreen(props: AuthLoginCredentialsScreenPrivateProps) {
  return (
    <LoginCredentialsScreen
      {...props}
      forgotPasswordRoute={(login?: string) =>
        CommonActions.navigate({
          name: authRouteNames.addAccountForgot,
          params: { platform: props.route.params.platform, mode: 'password', login }, // ToDo : get login from template here
        })
      }
      forgotIdRoute={CommonActions.navigate({
        name: authRouteNames.addAccountForgot,
        params: { platform: props.route.params.platform, mode: 'id' },
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
        handleConsumeError: handleAction(consumeAuthErrorAction),
      },
      dispatch,
    ),
)(AuthLoginCredentialsScreen);
