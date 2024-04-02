import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { consumeAuthErrorAction } from '~/framework/modules/auth/actions';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import LoginWAYFScreen, {
  LoginWayfScreenDispatchProps,
  LoginWayfScreenStoreProps,
} from '~/framework/modules/auth/templates/login-wayf';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

import type { AuthLoginWayfScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.loginWayf>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-wayf-main-title'),
  }),
});

export default connect(
  (state: any, props: AuthLoginWayfScreenPrivateProps): LoginWayfScreenStoreProps => {
    const auth = getAuthState(state);
    return {
      auth,
      error: auth.error,
    };
  },
  dispatch =>
    bindActionCreators<LoginWayfScreenDispatchProps>(
      {
        handleConsumeError: tryAction(consumeAuthErrorAction),
      },
      dispatch,
    ),
)(function AuthLoginWayfScreen(props: AuthLoginWayfScreenPrivateProps) {
  return (
    <LoginWAYFScreen
      wayfRoute={CommonActions.navigate({
        name: authRouteNames.wayf,
        params: { platform: props.route.params.platform, accountId: props.route.params.accountId },
      })}
      {...props}
    />
  );
});
