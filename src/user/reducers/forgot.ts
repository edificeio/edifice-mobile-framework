import { createEndSessionActionType } from '~/infra/redux/reducerFactory';
import { actionTypeForgetReceive, actionTypeForgotRequest } from '~/user/actions/forgot';

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IUserForgotState {
  fetching: boolean;
  result: { error?: string; status?: string; structures?: any[]; ok: boolean | undefined };
}

// THE REDUCER ------------------------------------------------------------------------------------

export const stateDefault: IUserForgotState = {
  fetching: false,
  result: { status: '', ok: undefined },
};

// eslint-disable-next-line @typescript-eslint/default-param-last
const authReducer = (state: IUserForgotState = stateDefault, action): IUserForgotState => {
  switch (action.type) {
    case actionTypeForgotRequest: {
      return {
        ...state,
        fetching: true,
        result: stateDefault.result,
      };
    }
    case actionTypeForgetReceive: {
      return {
        ...state,
        fetching: false,
        result: action.result,
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
