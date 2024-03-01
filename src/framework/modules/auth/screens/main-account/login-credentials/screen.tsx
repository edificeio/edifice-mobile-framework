import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { consumeAuthErrorAction, loginCredentialsActionMainAccount } from '~/framework/modules/auth/actions';
import { AuthPendingRedirection } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/auth/module-config';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import LoginCredentialsScreen from '~/framework/modules/auth/templates/login-credentials';
import { LoginCredentialsScreenDispatchProps } from '~/framework/modules/auth/templates/login-credentials/types';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Error } from '~/framework/util/error';
import { handleAction, tryAction } from '~/framework/util/redux/actions';
import { trackingActionAddSuffix } from '~/framework/util/tracker';

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
  return <LoginCredentialsScreen {...props} />;
}

export default connect(
  (state: IGlobalState) => {
    return {
      error: getAuthState(state).error,
    };
  },
  dispatch =>
    bindActionCreators<LoginCredentialsScreenDispatchProps>(
      {
        tryLogin: tryAction(loginCredentialsActionMainAccount, {
          track: res => [
            moduleConfig,
            res instanceof global.Error
              ? trackingActionAddSuffix('Login credentials', false)
              : res === AuthPendingRedirection.ACTIVATE
                ? trackingActionAddSuffix('Login credentials', 'Activation')
                : res === AuthPendingRedirection.RENEW_PASSWORD
                  ? trackingActionAddSuffix('Login credentials', 'Renouvellement')
                  : trackingActionAddSuffix('Login credentials', true),
            res instanceof global.Error ? Error.getDeepErrorType(res)?.toString() ?? res.toString() : undefined,
          ],
        }),
        handleConsumeError: handleAction(consumeAuthErrorAction),
      },
      dispatch,
    ),
)(AuthLoginCredentialsScreen);
