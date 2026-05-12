import * as React from 'react';

import { CommonActions } from '@react-navigation/native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { getState as getAuthState } from '~/framework/modules/auth/redux/reducer';
import LoginWAYFScreen, {
  AuthLoginWayfScreenDispatchProps,
  AuthLoginWayfScreenStoreProps,
} from '~/framework/modules/auth/templates/login-wayf';
import { consumeAuthErrorAction } from '~/framework/modules/auth/thunks';
import { tryAction } from '~/framework/util/redux/actions';

import type { AuthLoginWayfAddAccountScreenPrivateProps } from './types';

export const computeNavBar = screenOptions(() => ({ title: I18n.get('auth-wayf-main-title') }));
export default connect(
  (state: any): AuthLoginWayfScreenStoreProps => {
    const auth = getAuthState(state);
    return {
      auth,
      error: auth.error,
    };
  },
  dispatch =>
    bindActionCreators<AuthLoginWayfScreenDispatchProps>(
      {
        handleConsumeError: tryAction(consumeAuthErrorAction),
      },
      dispatch,
    ),
)(function AuthLoginWayfAddAccountScreen(props: AuthLoginWayfAddAccountScreenPrivateProps) {
  return (
    <LoginWAYFScreen
      wayfRoute={CommonActions.navigate({
        name: 'auth/add-account/wayf',
        params: { platform: props.route.params.platform },
      })}
      {...props}
    />
  );
});
