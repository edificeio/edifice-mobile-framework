import { actionTypeLogin, actionTypeLogout } from "../actions/login";
import { actionTypeSetNotifPrefs } from "../actions/notifPrefs";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IUserAuthState {
  login?: string;
  userId?: string;
  loggedIn: boolean;
  synced: boolean;
  error?: string;
  notificationPrefs?: any[];
}

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IUserAuthState = {
  loggedIn: false,
  notificationPrefs: [],
  synced: false
};

const authReducer = (state: IUserAuthState = stateDefault, action) => {
  switch (action.type) {
    case actionTypeLogin:
      console.log("dispatching :", action);
      return {
        error: "",
        loggedIn: true,
        login: action.userbook.login,
        notificationPrefs: state.notificationPrefs,
        synced: true,
        userId: action.userbook.id
      };
    case actionTypeLogout:
      console.log("dispatching logout: ", action);
      return stateDefault;
    case actionTypeSetNotifPrefs:
      console.log("dispatching set notif prefs: ", action);
      return {
        ...state,
        notificationPrefs: action.notificationPrefs
      };
    default:
      return state;
  }
};

export default authReducer;
