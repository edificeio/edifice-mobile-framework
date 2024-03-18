import { StackActions } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { loginFederationActionAddAnotherAccount } from '~/framework/modules/auth/actions';
import moduleConfig from '~/framework/modules/auth/module-config';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import WayfScreen, { WAYFScreenDispatchProps } from '~/framework/modules/auth/templates/wayf';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Error } from '~/framework/util/error';
import { tryAction } from '~/framework/util/redux/actions';
import { trackingActionAddSuffix } from '~/framework/util/tracker';

import { AuthWayfAddAccountScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.addAccountWayf>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-wayf-main-title'),
  }),
});

export default connect(
  (state: any, props: any) => {
    return {
      auth: getAuthState(state),
    };
  },
  dispatch =>
    bindActionCreators<WAYFScreenDispatchProps>(
      {
        tryLogin: tryAction(loginFederationActionAddAnotherAccount, {
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
        }),
      },
      dispatch,
    ),
)(function AuthWayfAddAccountScreen(props: AuthWayfAddAccountScreenPrivateProps) {
  return (
    <WayfScreen
      loginCredentialsNavAction={StackActions.replace(authRouteNames.addAccountLoginCredentials, {
        platform: props.route.params.platform,
      })}
      {...props}
    />
  );
});
