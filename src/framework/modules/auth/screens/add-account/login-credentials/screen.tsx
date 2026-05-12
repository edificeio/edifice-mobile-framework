import * as React from 'react';

import { CommonActions } from '@react-navigation/native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { IGlobalState } from '~/app/store';
import { getAccountsNumber, getState as getAuthState } from '~/framework/modules/auth/redux/reducer';
import AuthLoginCredentialsScreenTemplate from '~/framework/modules/auth/templates/login-credentials';
import { AuthLoginCredentialsScreenDispatchProps } from '~/framework/modules/auth/templates/login-credentials/types';
import {
  consumeAuthErrorAction,
  loginCredentialsActionAddAnotherAccount,
  loginCredentialsActionReplaceAccount,
} from '~/framework/modules/auth/thunks';
import track from '~/framework/modules/auth/tracking';
import { handleAction, tryAction } from '~/framework/util/redux/actions';

import type { AuthLoginCredentialsScreenPrivateProps } from './types';

export const computeNavBar = screenOptions(() => ({ title: I18n.get('auth-login-title') }));

function AuthLoginCredentialsScreen(props: AuthLoginCredentialsScreenPrivateProps) {
  console.info('AuthLoginCredentialsScreen', props);
  return (
    <AuthLoginCredentialsScreenTemplate
      {...props}
      forgotPasswordRoute={(login?: string) =>
        CommonActions.navigate({
          name: 'auth/add-account/forgot',
          params: { login, mode: 'password', platform: props.route.params.platform },
        })
      }
      forgotIdRoute={CommonActions.navigate({
        name: 'auth/add-account/forgot',
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
    bindActionCreators<AuthLoginCredentialsScreenDispatchProps>(
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
