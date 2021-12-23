/**
 * Activate account action(s)
 * Build actions to be dispatched to activate a new account
 */
import I18n from 'i18n-js';
import { Action } from 'redux';

import { actionTypeLoginCancel } from './actionTypes/login';
import { loginAction } from './login';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import { asyncActionTypes } from '~/infra/redux/async';
import { getLoginRouteName } from '~/navigation/LoginNavigator';
import { navigate } from '~/navigation/helpers/navHelper';
import userConfig from '~/user/config';
import { IActivationContext } from '~/utils/SubmitState';

// TYPES ------------------------------------------------------------------------------------------------

export interface IActivationUserInfo {
  login: string;
  activationCode: string;
}

export interface IActivationModel {
  activationCode: string;
  login: string;
  password: string;
  confirm: string;
  email: string;
  phone: string;
}

export interface IActivationSubmitPayload {
  theme: string;
  login: string;
  password: string;
  confirmPassword: string;
  acceptCGU: boolean;
  activationCode: string;
  callBack: string;
  mail: string;
  phone: string;
}

// ACTION INTERFACES --------------------------------------------------------------------------------

export interface IActivationContextFetchedAction extends Action {
  context: IActivationContext;
}

export interface IActivationContextRequestedAction extends Action {
  userinfo: IActivationUserInfo;
}

export interface IActivationSubmitRequestedAction extends Action {
  model: IActivationModel;
}
export interface IActivationSubmitErrorAction extends Action {
  message?: string;
}
// ACTION TYPES --------------------------------------------------------------------------------------

export const actionTypeActivationContext = asyncActionTypes(userConfig.createActionType('ACTIVATION_CONTEXT'));

export const actionTypeActivationSubmit = asyncActionTypes(userConfig.createActionType('ACTIVATION_SUBMIT'));

// ACTION CREATORS --------------------------------------------------------------------------------------

function activationContextRequested(args: IActivationUserInfo): IActivationContextRequestedAction {
  return { type: actionTypeActivationContext.requested, userinfo: args };
}
function activationContextReceived(context: IActivationContext): IActivationContextFetchedAction {
  return { type: actionTypeActivationContext.received, context };
}
function activationContextError(): Action {
  return { type: actionTypeActivationContext.fetchError };
}

function activationSubmitRequested(model: IActivationModel): IActivationSubmitRequestedAction {
  return { type: actionTypeActivationSubmit.requested, model };
}
function activationSubmitReceived(): Action {
  return { type: actionTypeActivationSubmit.received };
}
function activationSubmitError(message: string): IActivationSubmitErrorAction {
  return { type: actionTypeActivationSubmit.fetchError, message };
}

// THUNKS -----------------------------------------------------------------------------------------

export function initActivationAccount(args: IActivationUserInfo, redirect: boolean) {
  return async dispatch => {
    try {
      // === 1 - Fetch activation context
      dispatch(activationContextRequested(args));
      const res = await fetch(`${DEPRECATED_getCurrentPlatform()!.url}/auth/context`);
      // === 2 - Navigate if needed
      if (redirect) {
        console.log('[User][Activation] redirecting to Activation Page...');
        navigate('LoginActivation');
      }
      dispatch({ type: actionTypeLoginCancel });
      // === 3 - send result to store
      if (!res.ok) {
        console.log('[User][Activation] fetched context failed...', res.status);
        dispatch(activationContextError());
        return;
      }
      const activationContext: IActivationContext = await res.json();
      console.log('[User][Activation] fetched context :', activationContext);
      dispatch(activationContextReceived(activationContext));
    } catch (e) {
      console.warn(e);
      dispatch(activationContextError());
    }
  };
}

export function activationAccount(model: IActivationModel) {
  return async (dispatch, getState) => {
    try {
      // === 0 auto select the default theme
      const theme = DEPRECATED_getCurrentPlatform()!.webTheme;
      if (!theme) {
        console.warn('[User][Activation] activationAccount -> theme was not found:', DEPRECATED_getCurrentPlatform()!.webTheme);
      }
      // console.log("[User][Activation] setting default theme to", theme)
      // === 1 - prepare payload
      const payload: IActivationSubmitPayload = {
        acceptCGU: true,
        activationCode: model.activationCode,
        callBack: '',
        login: model.login,
        password: model.password,
        confirmPassword: model.confirm,
        mail: model.email || '',
        phone: model.phone,
        theme,
      };
      const formdata = new FormData();
      for (const key in payload) {
        formdata.append(key, payload[key]);
      }
      // === 2 - Send activation information
      // console.log("[User][Activation] submitting activation", formdata)
      dispatch(activationSubmitRequested(model));
      const res = await fetch(`${DEPRECATED_getCurrentPlatform()!.url}/auth/activation`, {
        body: formdata,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        method: 'post',
      });
      // === 3 - Check whether the activation was successfull
      // console.log("[User][Activation] finished getting body....", res.status, res)
      if (!res.ok) {
        // console.log("[User][Activation] failed with error", res.status)
        dispatch(activationSubmitError(I18n.t('activation-errorSubmit')));
        return;
      }
      // a json response can contains an error field
      if (res.headers.get('content-type').indexOf('application/json') !== -1) {
        // checking response header
        const resBody = await res.json();
        if (resBody.error) {
          console.log('[User][Activation] failed with error', res.status, resBody);
          dispatch(activationSubmitError(resBody.error.message));
          Trackers.trackEvent('Auth', 'ACTIVATE ERROR', resBody.error.message);
          return;
        }
      }

      // === 4 - call thunk login using login/password
      // console.log("[User][Activation] redirecting to login...", res.status, model)
      await dispatch(
        loginAction(true, {
          username: model.login,
          password: model.password,
        }),
      );
      // === 5 - activation finished successfully
      dispatch(activationSubmitReceived());
      // console.log("[User][Activate] finished!")
      // === 6 - Tracking
      Trackers.trackEvent('Auth', 'ACTIVATE');
    } catch (e) {
      console.warn('[User][Activation] failed to submit activation ', e);
      dispatch(activationSubmitError(I18n.t('activation-errorSubmit')));
      Trackers.trackEvent('Auth', 'ACTIVATE ERROR');
    }
  };
}

export function cancelActivationAccount() {
  return () => {
    navigate(getLoginRouteName());
  };
}
