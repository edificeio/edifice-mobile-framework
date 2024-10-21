import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import type { AuthChangePasswordScreenOwnProps, AuthChangePasswordScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { changePasswordActionAddAnotherAccount, manualLogoutAction } from '~/framework/modules/auth/actions';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getPlatformContext, getPlatformContextOf } from '~/framework/modules/auth/reducer';
import ChangePasswordScreen from '~/framework/modules/auth/templates/change-password';
import { ChangePasswordScreenDispatchProps } from '~/framework/modules/auth/templates/change-password/types';
import track from '~/framework/modules/auth/tracking';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.addAccountChangePassword>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-page-editpassword'),
  }),
});

export default connect(
  (state, props: AuthChangePasswordScreenPrivateProps) => {
    return {
      context: props.route.params.platform ? getPlatformContextOf(props.route.params.platform) : getPlatformContext(),
      session: undefined,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>, props: AuthChangePasswordScreenOwnProps) => {
    return bindActionCreators<ChangePasswordScreenDispatchProps>(
      {
        tryLogout: tryAction(manualLogoutAction),
        trySubmit: tryAction(
          changePasswordActionAddAnotherAccount,
          props.route.params.useResetCode ? { track: track.passwordRenew } : undefined
        ),
      },
      dispatch
    );
  }
)(function AuthChangePasswordScreen(props: AuthChangePasswordScreenPrivateProps) {
  return <ChangePasswordScreen {...props} />;
});
