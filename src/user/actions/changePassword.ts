import I18n from 'i18n-js';
import { Action, Dispatch, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { getSessionInfo } from '~/App';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import { notifierShowAction } from '~/infra/notifier/actions';
import { asyncActionTypes } from '~/infra/redux/async';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';
import userConfig from '~/user/config';
import { IActivationContext } from '~/utils/SubmitState';

// TYPES ------------------------------------------------------------------------------------------------

export interface IChangePasswordModel {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

export interface IChangePasswordUserInfo {
  login: string;
}

export interface IChangePasswordSubmitPayload {
  oldPassword: string;
  password: string;
  confirmPassword: string;
  login: string;
  callback: string;
}

// ACTION INTERFACES --------------------------------------------------------------------------------

export interface IChangePasswordContextFetchedAction extends Action {
  context: IActivationContext;
}

export interface IChangePasswordContextRequestedAction extends Action {
  userinfo: IChangePasswordUserInfo;
}

export interface IChangePasswordSubmitRequestedAction extends Action {
  model: IChangePasswordModel;
}
export interface IChangePasswordSubmitErrorAction extends Action {
  message?: string;
}

// ACTION TYPES --------------------------------------------------------------------------------------

export const actionTypeActivationContext = asyncActionTypes(userConfig.createActionType('CHANGE_PASSWORD_CONTEXT'));

export const actionTypeChangePasswordSubmit = asyncActionTypes(userConfig.createActionType('CHANGE_PASSWORD_SUBMIT'));

export const actionTypeChangePasswordReset = userConfig.createActionType('CHANGE_PASSWORD_RESET');

// ACTION CREATORS --------------------------------------------------------------------------------------

function changePasswordContextRequestedAction(args: IChangePasswordUserInfo): IChangePasswordContextRequestedAction {
  return { type: actionTypeActivationContext.requested, userinfo: args };
}
function changePasswordContextReceivedAction(context: IActivationContext): IChangePasswordContextFetchedAction {
  return { type: actionTypeActivationContext.received, context };
}
function changePasswordContextErrorAction(): Action {
  return { type: actionTypeActivationContext.fetchError };
}

function changePasswordSubmitRequestedAction(model: IChangePasswordModel): IChangePasswordSubmitRequestedAction {
  return { type: actionTypeChangePasswordSubmit.requested, model };
}
function changePasswordSubmitReceivedAction(): Action {
  return { type: actionTypeChangePasswordSubmit.received };
}
function changePasswordSubmitErrorAction(message: string): IChangePasswordSubmitErrorAction {
  return { type: actionTypeChangePasswordSubmit.fetchError, message };
}
export function changePasswordResetAction(): Action {
  return { type: actionTypeChangePasswordReset };
}

// THUNKS -----------------------------------------------------------------------------------------

export function initChangePasswordAction(args: IChangePasswordUserInfo) {
  return async (dispatch: Dispatch) => {
    try {
      // === 1 - Fetch activation context
      dispatch(changePasswordContextRequestedAction(args));
      const res = await fetch(`${DEPRECATED_getCurrentPlatform()!.url}/auth/context`);
      // === 2 - send result to store
      if (!res.ok) {
        // console.log("[User][Change password] fetched context failed...", res.status)
        dispatch(changePasswordContextErrorAction());
        return;
      }
      const activationContext: IActivationContext = await res.json();
      // console.log("[User][Change password] fetched context :", activationContext)
      dispatch(changePasswordContextReceivedAction(activationContext));
    } catch (e) {
      dispatch(changePasswordContextErrorAction());
    }
  };
}

export function changePasswordAction(model: IChangePasswordModel) {
  return async (dispatch: Dispatch & ThunkDispatch<any, void, AnyAction>, getState: () => any) => {
    try {
      // === 1 - prepare payload
      const payload: IChangePasswordSubmitPayload = {
        oldPassword: model.oldPassword,
        password: model.newPassword,
        confirmPassword: model.confirm,
        login: getSessionInfo().login!,
        callback: '',
      };
      const formdata = new FormData();
      for (const key in payload) {
        formdata.append(key, payload[key as keyof IChangePasswordSubmitPayload]);
      }
      // === 2 - Send change password information
      // console.log("[User][Change password] submitting new password", formdata)
      dispatch(changePasswordSubmitRequestedAction(model));
      const res = await fetch(`${DEPRECATED_getCurrentPlatform()!.url}/auth/reset`, {
        body: formdata,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        method: 'post',
      });
      // === 3 - Check whether the c-password change was successfull
      // console.log("[User][Change password] finished getting body....", res.status, res)
      if (!res.ok) {
        // console.log("[User][Change password] failed with error", res.status)
        dispatch(changePasswordSubmitErrorAction(I18n.t('changePassword-errorSubmit')));
        return;
      }
      // a json response can contains an error field
      if (res.headers.get('content-type') && res.headers.get('content-type')!.indexOf('application/json') !== -1) {
        // checking response header
        const resBody = await res.json();
        if (resBody.error) {
          // console.log("[User][Change password] failed with error", res.status, resBody)
          dispatch(changePasswordSubmitErrorAction(I18n.t('changePassword-errorFields')));
          return;
        }
      }

      // === 5 - change password finished successfully
      dispatch(changePasswordSubmitReceivedAction());
      mainNavNavigate('MyProfile');
      dispatch(
        notifierShowAction({
          id: 'profile',
          text: I18n.t('PasswordChangeSuccess'),
          icon: 'checked',
          type: 'success',
        }),
      );
      // console.log("[User][Change password] finished!")
      Trackers.trackEvent('Profile', 'CHANGE PASSWORD');
    } catch (e) {
      console.warn('[User][Change password] failed to submit', e);
      dispatch(changePasswordSubmitErrorAction(I18n.t('changePassword-errorSubmit')));
      Trackers.trackEvent('Profile', 'CHANGE PASSWORD ERROR');
    }
  };
}

export function cancelChangePasswordAction() {
  return () => {
    mainNavNavigate('MyProfile');
  };
}
