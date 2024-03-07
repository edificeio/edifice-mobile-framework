import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import {
  buildChangePasswordActionReplaceAccount,
  changePasswordActionAddFirstAccount,
  manualLogoutAction,
} from '~/framework/modules/auth/actions';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getPlatformContext, getPlatformContextOf, getSession } from '~/framework/modules/auth/reducer';
import ChangePasswordScreen from '~/framework/modules/auth/templates/change-password';
import { ChangePasswordScreenDispatchProps } from '~/framework/modules/auth/templates/change-password/types';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

import type { AuthChangePasswordScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<
  AuthNavigationParams,
  typeof authRouteNames.changePassword | typeof authRouteNames.changePasswordModal
>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-page-editpassword'),
  }),
});

export default connect(
  (state, props: AuthChangePasswordScreenPrivateProps) => {
    return {
      session: getSession(),
      context: props.route.params.platform ? getPlatformContextOf(props.route.params.platform) : getPlatformContext(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>, props: AuthChangePasswordScreenPrivateProps) => {
    return bindActionCreators<ChangePasswordScreenDispatchProps>(
      {
        trySubmit: tryAction(
          props.session ? buildChangePasswordActionReplaceAccount(props.session.user.id) : changePasswordActionAddFirstAccount,
        ),
        tryLogout: tryAction(manualLogoutAction),
      },
      dispatch,
    );
  },
)(function AuthChangePasswordScreen(props: AuthChangePasswordScreenPrivateProps) {
  return <ChangePasswordScreen {...props} />;
});
