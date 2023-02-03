import { IEntcoreWidget } from '~/framework/util/moduleTool';
import { computeUserSession } from '~/framework/util/session';
import { createEndSessionActionType } from '~/infra/redux/reducerFactory';
import { actionTypeLegalDocuments } from '~/user/actions/actionTypes/legalDocuments';
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
  INewVersionAction,
  IVersionContext,
  actionTypeNewVersion,
  actionTypeRequestVersion,
  actionTypeSkipVersion,
} from '~/user/actions/version';

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export type backendUserApp = {
  name: string;
  address: string;
  displayName: string;
  display: boolean;
  prefix: string;
};

export type LegalUrls = {
  userCharter?: string;
  cgu?: string;
  personalDataProtection?: string;
  cookies?: string;
};

export interface IUserAuthState {
  // user account information
  login?: string;
  userId?: string;
  error?: string;
  errtype?: string;
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
  widgets: IEntcoreWidget[];
  //legal documents
  legalUrls: LegalUrls;
}

// THE REDUCER ------------------------------------------------------------------------------------

export const stateDefault: IUserAuthState = {
  apps: [],
  appsInfo: [],
  widgets: [],
  loggedIn: false,
  loggingIn: false,
  notification: null,
  notificationPrefs: [],
  platformId: null,
  synced: false,
  skipVersion: false,
  versionContext: null,
  legalUrls: {
    userCharter: undefined,
    cgu: undefined,
    personalDataProtection: undefined,
    cookies: undefined,
  },
};

const authReducer = (state: IUserAuthState = stateDefault, action): IUserAuthState => {
  switch (action.type) {
    case actionTypeSkipVersion: {
      const ret = {
        ...state,
        skipVersion: true,
      };
      return ret;
    }
    case actionTypeNewVersion: {
      const aVersion: INewVersionAction = action;
      const ret = {
        ...state,
        loggingIn: false,
        versionContext: { ...aVersion },
      };
      return ret;
    }
    case actionTypeRequestLogin:
    case actionTypeRequestVersion: {
      const ret = {
        ...state,
        error: '',
        errtype: '',
        loggingIn: true,
      };
      return ret;
    }
    case actionTypeLoggedIn: {
      const ret = {
        ...state,
        apps: action.userbook.apps,
        appsInfo: action.userbook.appsInfo,
        widgets: action.userbook.widgets,
        error: '',
        errtype: '',
        loggedIn: true,
        loggingIn: false,
        login: action.userbook.login,
        synced: true,
        userId: action.userbook.id,
      };
      computeUserSession(ret, undefined);
      return ret;
    }
    case actionTypeLoggedInPartial: {
      const ret = {
        ...state,
        login: action.userbook.login,
        userId: action.userbook.id,
        apps: action.userbook.apps,
        appsInfo: action.userbook.appsInfo,
        widgets: action.userbook.widgets,
        error: '',
        errtype: '',
        loggedIn: false,
        loggingIn: false,
      };
      computeUserSession(ret, undefined);
      return ret;
    }
    case actionTypeLoginError: {
      const ret = {
        ...stateDefault,
        error: action.errmsg,
        errtype: action.errtype,
        loggingIn: false,
        platformId: state.platformId,
      };
      computeUserSession(ret, undefined);
      return ret;
    }
    case actionTypeLoginCancel:
      return {
        ...state,
        error: '',
        errtype: '',
        loggingIn: false,
      };
    case actionTypeLoggedOut: {
      const { error } = state;
      const ret = {
        ...stateDefault,
        error,
        errtype: '',
        platformId: state.platformId,
      };
      computeUserSession(ret, undefined);
      return ret;
    }
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
    case actionTypeLegalDocuments:
      return {
        ...state,
        legalUrls: { ...state.legalUrls, ...action.legalUrls },
      };
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return stateDefault;
    default:
      return state;
  }
};

export default authReducer;
