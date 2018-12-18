import {
  actionTypeLoggedIn,
  actionTypeLoggedOut,
  actionTypeLoginError,
  actionTypeRequestLogin
} from "../actions/login";
import { actionTypeSetNotifPrefs } from "../actions/notifPrefs";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

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
  // technical
  notification: Notification;
}

// THE REDUCER ------------------------------------------------------------------------------------

export const stateDefault: IUserAuthState = {
  apps: [],
  loggedIn: false,
  loggingIn: false,
  notification: null,
  notificationPrefs: [],
  synced: false
};

const authReducer = (state: IUserAuthState = stateDefault, action) => {
  switch (action.type) {
    case actionTypeRequestLogin:
      return {
        ...state,
        error: "",
        loggingIn: true
      };
    case actionTypeLoggedIn:
      return {
        ...state,
        apps: action.userbook.apps,
        error: "",
        loggedIn: true,
        loggingIn: false,
        login: action.userbook.login,
        synced: true,
        userId: action.userbook.id
      };
    case actionTypeLoginError:
      return {
        ...stateDefault,
        error: action.errmsg,
        loggingIn: false
      };
    case actionTypeLoggedOut:
      return stateDefault;
    case actionTypeSetNotifPrefs:
      return {
        ...state,
        notificationPrefs: action.notificationPrefs
      };
    case "NOTIFICATION_OPEN":
      return {
        ...state,
        notification: action.notification
      };
    default:
      return state;
  }
};

export default authReducer;
