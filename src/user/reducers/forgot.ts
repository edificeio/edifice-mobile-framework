import { actionTypeForgotRequest, actionTypeForgetReceive } from "../actions/forgot";
import { createEndSessionActionType } from "../../infra/redux/reducerFactory";

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
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return stateDefault;
    default:
      return state;
  }
};

export default authReducer;
