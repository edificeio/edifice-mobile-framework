import * as React from 'react';

import { StackActions } from '@react-navigation/native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { getState as getAuthState, getSession } from '~/framework/modules/auth/redux/reducer';
import WayfScreen, { IWayfScreenProps, WAYFScreenDispatchProps } from '~/framework/modules/auth/templates/wayf';
import { buildLoginFederationActionReplaceAccount, loginFederationActionAddFirstAccount } from '~/framework/modules/auth/thunks';
import track from '~/framework/modules/auth/tracking';
import { tryAction } from '~/framework/util/redux/actions';

export const AuthWayfScreenOptions = screenOptions(() => ({
  title: I18n.get('auth-wayf-main-title'),
}));

export const AuthWayfScreen = connect(
  (state: any) => {
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
)(function AuthWayfScreen(props: Omit<IWayfScreenProps, 'loginCredentialsNavAction'>) {
  return (
    <WayfScreen
      loginCredentialsNavAction={StackActions.replace('auth/login/credentials', {
        accountId: props.route.params.accountId,
        platform: props.route.params.platform,
      })}
      {...props}
    />
  );
});
