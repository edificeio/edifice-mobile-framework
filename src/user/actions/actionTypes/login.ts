import userConfig from '~/user/config';

export const actionTypeRequestLogin = userConfig.createActionType('REQUEST_LOGIN');
export const actionTypeLoggedIn = userConfig.createActionType('LOGGED_IN');
export const actionTypeLoggedInPartial = userConfig.createActionType('LOGGED_IN_PARTIAL');
export const actionTypeLoginError = userConfig.createActionType('LOGIN_ERROR');
export const actionTypeLoggedOut = userConfig.createActionType('LOGGED_OUT');
export const actionTypeLoginCancel = userConfig.createActionType('LOGIN_CANCEL');
