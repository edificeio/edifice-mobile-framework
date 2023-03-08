/**
 * Activate account action(s)
 * Build actions to be dispatched to activate a new account
 */
import { Action } from 'redux';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { uniqueId } from '~/infra/oauth';
import { asyncActionTypes } from '~/infra/redux/async';
import userConfig from '~/user/config';

// TYPES ------------------------------------------------------------------------------------------

export interface IForgotModel {
  login: string;
  firstName?: string | null;
  structureId?: string | null;
}

export interface IForgotSubmitPayload extends IForgotModel {
  service: 'mail';
}

// ACTION INTERFACES ------------------------------------------------------------------------------

export interface IForgotSubmitRequestedAction extends Action {
  model: IForgotModel;
}
export interface IForgotSubmitReceivedAction extends Action {
  result: { error: string } | { status: string };
}

// ACTION TYPES -----------------------------------------------------------------------------------

export const actionTypeForgotRequest = asyncActionTypes(userConfig.createActionType('FORGOT_REQUESTED'));

export const actionTypeForgetReceive = asyncActionTypes(userConfig.createActionType('FORGET_RECEIVED'));

// ACTION CREATORS --------------------------------------------------------------------------------

function actionCreateForgotRequest(userLogin: string) {
  return { type: actionTypeForgotRequest, userLogin };
}

function actionCreateForgotReceive(result: { error?: string; status?: string; structures?: any[]; ok: boolean | undefined }) {
  return { type: actionTypeForgetReceive, result };
}

// THUNKS -----------------------------------------------------------------------------------------

export function actionForgotSubmit(userInfo: IForgotModel, forgotId?: boolean) {
  return async dispatch => {
    try {
      dispatch(actionCreateForgotRequest(userInfo.login));
      const payLoad = forgotId
        ? {
            mail: userInfo.login,
            firstName: userInfo.firstName,
            structureId: userInfo.structureId,
            service: 'mail',
          }
        : {
            login: userInfo.login,
            service: 'mail',
          };
      const res = await fetch(`${DEPRECATED_getCurrentPlatform()!.url}/auth/forgot-${forgotId ? 'id' : 'password'}`, {
        body: JSON.stringify(payLoad),
        method: 'POST',
        headers: {
          'X-Device-Id': uniqueId(),
        },
      });
      const resJson = await res.json();
      const resStatus = await res.status;
      const ok = resStatus >= 200 && resStatus < 300;
      const response = { ...resJson, ok };
      dispatch(actionCreateForgotReceive(response));
    } catch (err) {
      dispatch(actionCreateForgotReceive({ error: '', ok: false }));
    }
  };
}

export function actionForgotReset() {
  return async dispatch => {
    dispatch(actionCreateForgotReceive({ status: '', ok: false }));
  };
}
