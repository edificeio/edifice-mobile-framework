import * as React from 'react';

import { StackActions } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { AuthWayfScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { buildLoginFederationActionReplaceAccount, loginFederationActionAddFirstAccount } from '~/framework/modules/auth/actions';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getState as getAuthState, getSession } from '~/framework/modules/auth/reducer';
import WayfScreen, { WAYFScreenDispatchProps } from '~/framework/modules/auth/templates/wayf';
import track from '~/framework/modules/auth/tracking';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

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
      auth: getAuthState(state),
      session: getSession(),
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
            track: track.loginFederation,
          },
        ),
      },
      dispatch,
    ),
)(function AuthWayfScreen(props: AuthWayfScreenPrivateProps) {
  return (
    <WayfScreen
      loginCredentialsNavAction={StackActions.replace(authRouteNames.loginCredentials, {
        accountId: props.route.params.accountId,
        platform: props.route.params.platform,
      })}
      {...props}
    />
  );
});
