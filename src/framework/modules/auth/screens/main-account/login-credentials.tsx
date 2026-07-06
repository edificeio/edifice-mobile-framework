import * as React from 'react';

import { CommonActions } from '@react-navigation/native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { IGlobalState } from '~/app/store';
import { authRouteNames } from '~/framework/modules/auth/navigation';
import { getAccountsNumber, getState as getAuthState } from '~/framework/modules/auth/redux/reducer';
import AuthLoginCredentialsScreenTemplate from '~/framework/modules/auth/templates/login-credentials';
import {
  AuthLoginCredentialsScreenDispatchProps,
  AuthLoginCredentialsScreenProps,
} from '~/framework/modules/auth/templates/login-credentials/types';
import {
  consumeAuthErrorAction,
  loginCredentialsActionAddFirstAccount,
  loginCredentialsActionReplaceAccount,
} from '~/framework/modules/auth/thunks';
import track from '~/framework/modules/auth/tracking';
import { handleAction, tryAction } from '~/framework/util/redux/actions';

export const AuthLoginCredentialsScreenOptions = screenOptions(() => ({
  title: I18n.get('auth-login-title'),
}));

function AuthLoginCredentialsScreen(props: Omit<AuthLoginCredentialsScreenProps, 'forgotPasswordRoute' | 'forgotIdRoute'>) {
  return (
    <AuthLoginCredentialsScreenTemplate
      {...props}
      forgotPasswordRoute={(login?: string) =>
        CommonActions.navigate({
          name: authRouteNames.forgot,
          params: { login, mode: 'password', platform: props.route.params.platform },
        })
      }
      forgotIdRoute={CommonActions.navigate({
        name: authRouteNames.forgot,
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
        tryLoginAdd: tryAction(loginCredentialsActionAddFirstAccount, {
          track: track.loginCredentials,
        }),
        tryLoginReplace: tryAction(loginCredentialsActionReplaceAccount, {
          track: track.loginCredentials,
        }),
      },
      dispatch,
    ),
)(AuthLoginCredentialsScreen);
