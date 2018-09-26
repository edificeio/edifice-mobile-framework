import { actionTypeLogin } from "../actions/login";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IUserAuthState {
  login?: string;
  userId?: string;
  loggedIn: boolean;
  synced: boolean;
  error?: string;
  notificationPrefs?: any;
}

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IUserAuthState = {
  loggedIn: false,
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
    // TODO action Logout
    default:
      return state;
  }
};

export default authReducer;
