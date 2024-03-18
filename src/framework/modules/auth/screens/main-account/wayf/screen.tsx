import { StackActions } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { buildLoginFederationActionReplaceAccount, loginFederationActionAddFirstAccount } from '~/framework/modules/auth/actions';
import moduleConfig from '~/framework/modules/auth/module-config';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getState as getAuthState, getSession } from '~/framework/modules/auth/reducer';
import WayfScreen, { WAYFScreenDispatchProps } from '~/framework/modules/auth/templates/wayf';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Error } from '~/framework/util/error';
import { tryAction } from '~/framework/util/redux/actions';
import { trackingActionAddSuffix } from '~/framework/util/tracker';

import { AuthWayfScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.wayf>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-wayf-main-title'),
  }),
});

export default connect(
  (state: any, props: any) => {
    return {
      session: getSession(),
      auth: getAuthState(state),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>, props: any) =>
    bindActionCreators<WAYFScreenDispatchProps>(
      {
        tryLogin: tryAction(
          props.session
            ? buildLoginFederationActionReplaceAccount(props.session.user.id, props.session.addTimestamp)
            : loginFederationActionAddFirstAccount,
          {
            track: res => {
              const errtype = res instanceof global.Error ? Error.getDeepErrorType<typeof Error.LoginError>(res) : undefined;
              return [
                moduleConfig,
                res instanceof global.Error
                  ? errtype === Error.OAuth2ErrorType.SAML_MULTIPLE_VECTOR
                    ? trackingActionAddSuffix('Login fédéré', 'Multiple')
                    : trackingActionAddSuffix('Login fédéré', false)
                  : trackingActionAddSuffix('Login fédéré', true),
                res instanceof global.Error && errtype !== Error.OAuth2ErrorType.SAML_MULTIPLE_VECTOR
                  ? errtype?.toString() ?? res.toString()
                  : undefined,
                res instanceof Error.SamlMultipleVectorError ? res.data.users.length : undefined,
              ];
            },
          },
        ),
      },
      dispatch,
    ),
)(function AuthWayfScreen(props: AuthWayfScreenPrivateProps) {
  return (
    <WayfScreen
      loginCredentialsNavAction={StackActions.replace(authRouteNames.loginCredentials, { platform: props.route.params.platform })}
      {...props}
    />
  );
});
