import { Action } from 'redux';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { asyncActionTypes } from '~/infra/redux/async';
import { navigate } from '~/navigation/helpers/navHelper';
import userConfig from '~/user/config';
import { IUserAuthContext } from '~/user/service';

import type { IActivationContextFetchedAction, IActivationContextRequestedAction, IActivationUserInfo } from './activation';

export const actionTypeActivationContext = asyncActionTypes(userConfig.createActionType('ACTIVATION_CONTEXT'));

function activationContextRequested(args: IActivationUserInfo): IActivationContextRequestedAction {
  return { type: actionTypeActivationContext.requested, userinfo: args };
}
function activationContextReceived(context: IUserAuthContext): IActivationContextFetchedAction {
  return { type: actionTypeActivationContext.received, context };
}
function activationContextError(): Action {
  return { type: actionTypeActivationContext.fetchError };
}

export function initActivationAccount(args: IActivationUserInfo, redirect: boolean, rememberMe?: boolean) {
  return async dispatch => {
    try {
      // === 1 - Fetch activation context
      dispatch(activationContextRequested(args));
      const res = await fetch(`${DEPRECATED_getCurrentPlatform()!.url}/auth/context`);
      // === 2 - Navigate if needed
      if (redirect) {
        navigate('LoginActivation', { rememberMe });
      }
      // === 3 - send result to store
      if (!res.ok) {
        dispatch(activationContextError());
        return;
      }
      const activationContext: IUserAuthContext = await res.json();
      dispatch(activationContextReceived(activationContext));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      dispatch(activationContextError());
    }
  };
}
