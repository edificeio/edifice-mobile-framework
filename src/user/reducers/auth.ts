import { createEndSessionActionType } from '~/infra/redux/reducerFactory';
import {
  actionTypeLoggedIn,
  actionTypeLoggedInPartial,
  actionTypeLoggedOut,
  actionTypeLoginCancel,
  actionTypeLoginError,
  actionTypeRequestLogin,
} from '~/user/actions/actionTypes/login';
import { actionTypeSetNotifPrefs } from '~/user/actions/notifPrefs';
import { actionTypePlatformSelect } from '~/user/actions/platform';
import {
  actionTypeNewVersion,
  actionTypeRequestVersion,
  actionTypeSkipVersion,
  INewVersionAction,
  IVersionContext,
} from '~/user/actions/version';

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export type backendUserApp = {
  name: string;
  address: string;
  displayName: string;
  display: boolean;
  prefix: string;
};

export interface IUserAuthState {
  // user account information
  login?: string;
  userId?: string;
  error?: string;
  notificationPrefs?: any[];
  // user auth state
  loggedIn: boolean;
  synced: boolean;
  loggingIn: boolean;
  // available applications
  apps: string[];
  appsInfo: backendUserApp[];
  // technical
  notification: Notification;
  // platform
  platformId?: string;
  //version
  skipVersion: boolean;
  versionContext: IVersionContext;
}

// THE REDUCER ------------------------------------------------------------------------------------

export const stateDefault: IUserAuthState = {
  apps: [],
  appsInfo: [],
  loggedIn: false,
  loggingIn: false,
  notification: null,
  notificationPrefs: [],
  platformId: null,
  synced: false,
  skipVersion: false,
  versionContext: null,
};

const authReducer = (state: IUserAuthState = stateDefault, action): IUserAuthState => {
  switch (action.type) {
    case actionTypeSkipVersion: {
      return {
        ...state,
        skipVersion: true,
      };
    }
    case actionTypeNewVersion: {
      const aVersion: INewVersionAction = action;
      return {
        ...state,
        loggingIn: false,
        versionContext: { ...aVersion },
      };
    }
    case actionTypeRequestLogin:
    case actionTypeRequestVersion:
      return {
        ...state,
        error: '',
        loggingIn: true,
      };
    case actionTypeLoggedIn:
      return {
        ...state,
        apps: action.userbook.apps,
        appsInfo: action.userbook.appsInfo,
        error: '',
        loggedIn: true,
        loggingIn: false,
        login: action.userbook.login,
        synced: true,
        userId: action.userbook.id,
      };
    case actionTypeLoggedInPartial:
      return {
        ...state,
        login: action.userbook.login,
        userId: action.userbook.id,
        apps: action.userbook.apps,
        appsInfo: action.userbook.appsInfo,
        error: '',
        loggedIn: false,
        loggingIn: false,
      };
    case actionTypeLoginError:
      return {
        ...stateDefault,
        error: action.errmsg,
        loggingIn: false,
        platformId: state.platformId,
      };
    case actionTypeLoginCancel:
      return {
        ...state,
        loggingIn: false,
      };
    case actionTypeLoggedOut:
      const { error } = state;
      return {
        ...stateDefault,
        error,
        platformId: state.platformId,
      };
    case actionTypeSetNotifPrefs:
      return {
        ...state,
        notificationPrefs: action.notificationPrefs,
      };
    case 'NOTIFICATION_OPEN':
      return {
        ...state,
        notification: action.notification,
      };
    case actionTypePlatformSelect:
      return {
        ...state,
        platformId: action.platformId,
      };
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return stateDefault;
    default:
      return state;
  }
};

export default authReducer;
