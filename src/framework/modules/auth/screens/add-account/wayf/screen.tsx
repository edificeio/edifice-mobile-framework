import * as React from 'react';

import { StackActions } from '@react-navigation/native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { getState as getAuthState } from '~/framework/modules/auth/redux/reducer';
import WayfScreen, { WAYFScreenDispatchProps } from '~/framework/modules/auth/templates/wayf';
import { loginFederationActionAddAnotherAccount } from '~/framework/modules/auth/thunks';
import track from '~/framework/modules/auth/tracking';
import { tryAction } from '~/framework/util/redux/actions';

import { AuthWayfAddAccountScreenPrivateProps } from './types';

export const computeNavBar = screenOptions(() => ({ title: I18n.get('auth-wayf-main-title') }));

export default connect(
  (state: any) => {
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
      loginCredentialsNavAction={StackActions.replace('auth/add-account/login/credentials', {
        platform: props.route.params.platform,
      })}
      {...props}
    />
  );
});
