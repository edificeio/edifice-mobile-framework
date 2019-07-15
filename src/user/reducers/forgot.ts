import {
  actionTypeLoggedIn,
  actionTypeLoggedOut,
  actionTypeLoginCancel,
  actionTypeLoginError,
  actionTypeRequestLogin
} from "../actions/login";
import { actionTypeSetNotifPrefs } from "../actions/notifPrefs";
import { actionTypePlatformSelect } from "../actions/platform";
import {
  actionTypeNewVersion,
  actionTypeRequestVersion,
  actionTypeSkipVersion,
  INewVersionAction,
  IVersionContext
} from "../actions/version";
import { actionTypeForgotRequest, actionTypeForgetReceive } from "../actions/forgot";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IUserForgotState {
  fetching: boolean;
  result: { error: string } | { status: string };
}

// THE REDUCER ------------------------------------------------------------------------------------

export const stateDefault: IUserForgotState = {
  fetching: false,
  result: { status: "" }
};

const authReducer = (
  state: IUserForgotState = stateDefault,
  action
): IUserForgotState => {
  switch (action.type) {
    case actionTypeForgotRequest: {
      return {
        ...state,
        fetching: true,
        result: stateDefault.result
      };
    }
    case actionTypeForgetReceive: {
      return {
        ...state,
        fetching: false,
        result: action.result
      };
    }
    default:
      return state;
  }
};

export default authReducer;
