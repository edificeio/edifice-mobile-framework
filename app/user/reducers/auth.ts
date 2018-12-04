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
}

// THE REDUCER ------------------------------------------------------------------------------------

export const stateDefault: IUserAuthState = {
  apps: [],
  loggedIn: false,
  loggingIn: false,
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
        apps: action.userbook.apps,
        error: "",
        loggedIn: true,
        loggingIn: false,
        login: action.userbook.login,
        notificationPrefs: state.notificationPrefs,
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
    default:
      return state;
  }
};

export default authReducer;
