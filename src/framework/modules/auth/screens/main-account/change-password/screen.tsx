import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import type { AuthChangePasswordScreenOwnProps, AuthChangePasswordScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import {
  buildChangePasswordActionReplaceAccount,
  changePasswordActionAddFirstAccount,
  manualLogoutAction,
} from '~/framework/modules/auth/actions';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getPlatformContext, getPlatformContextOf, getSession } from '~/framework/modules/auth/reducer';
import * as selectors from '~/framework/modules/auth/redux/selectors';
import ChangePasswordScreen from '~/framework/modules/auth/templates/change-password';
import { ChangePasswordScreenDispatchProps } from '~/framework/modules/auth/templates/change-password/types';
import track from '~/framework/modules/auth/tracking';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<
  AuthNavigationParams,
  typeof authRouteNames.changePassword | typeof authRouteNames.changePasswordModal
>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    backButtonTestID: 'change-password-back',
    navigation,
    route,
    title: I18n.get('user-page-editpassword'),
    titleTestID: 'change-password-title',
  }),
});

export default connect(
  (state, props: AuthChangePasswordScreenPrivateProps) => {
    return {
      context: props.route.params.platform ? getPlatformContextOf(props.route.params.platform) : getPlatformContext(),
      session: getSession(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>, props: AuthChangePasswordScreenOwnProps) => {
    return bindActionCreators<ChangePasswordScreenDispatchProps>(
      {
        tryLogout: tryAction(manualLogoutAction),
        trySubmit: tryAction(
          (...args: Parameters<typeof changePasswordActionAddFirstAccount>) =>
            (d, gs) => {
              const session = selectors.session(gs());
              const replaceAccountId = session ? session.user.id : props.route.params.replaceAccountId;
              const replaceAccountTimestamp = session ? session.addTimestamp : props.route.params.replaceAccountTimestamp;
              const action =
                replaceAccountId && replaceAccountTimestamp
                  ? buildChangePasswordActionReplaceAccount(replaceAccountId, replaceAccountTimestamp)
                  : changePasswordActionAddFirstAccount;

              return d(action(...args));
            },
          props.route.params.useResetCode ? { track: track.passwordRenew } : undefined,
        ),
      },
      dispatch,
    );
  },
)(function AuthChangePasswordScreen(props: AuthChangePasswordScreenPrivateProps) {
  return <ChangePasswordScreen {...props} />;
});
