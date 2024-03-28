import { StackActions } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { loginFederationActionAddAnotherAccount } from '~/framework/modules/auth/actions';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import WayfScreen, { WAYFScreenDispatchProps } from '~/framework/modules/auth/templates/wayf';
import track from '~/framework/modules/auth/tracking';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

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
        tryLogin: tryAction(
          tryAction(loginFederationActionAddAnotherAccount, {
            track: track.loginFederation,
          }),
          { track: track.addAccount },
        ),
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
