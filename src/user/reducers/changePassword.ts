import { SubmitState, ContextState, IActivationContext } from "../../utils/SubmitState";
import { IChangePasswordUserInfo, IChangePasswordModel, actionTypeActivationContext, IChangePasswordContextRequestedAction, IChangePasswordContextFetchedAction, IChangePasswordSubmitErrorAction, actionTypeChangePasswordSubmit, IChangePasswordSubmitRequestedAction, actionTypeChangePasswordReset } from "../actions/changePassword";
import { AnyAction } from "redux";
import { createEndSessionActionType } from "../../infra/redux/reducerFactory";

export interface IChangePasswordState {
  isPerforming: boolean
  context: IActivationContext
  userinfo: IChangePasswordUserInfo
  submitted: IChangePasswordModel,
  submitState: SubmitState
  contextState: ContextState,
  submitError: string
}

// THE REDUCER ------------------------------------------------------------------------------------

export const stateDefault: IChangePasswordState = {
  isPerforming: false,
  context: {
    cgu: true,
    passwordRegex: "",
    mandatory: { mail: false, phone: false }
  },
  submitted: {
    oldPassword: "",
    newPassword: "",
    confirm: ""
  },
  userinfo: { login: "" },
  contextState: ContextState.Void,
  submitState: SubmitState.Void,
  submitError: ""
};

const changePasswordReducer = (state: IChangePasswordState = stateDefault, action: AnyAction): IChangePasswordState => {
  switch (action.type) {
    case actionTypeActivationContext.requested:
      return {
        ...state,
        userinfo: (action as IChangePasswordContextRequestedAction).userinfo,
        contextState: ContextState.Loading
      };
    case actionTypeActivationContext.received:
      return {
        ...state,
        context: (action as IChangePasswordContextFetchedAction).context,
        contextState: ContextState.Success,
        isPerforming: true
      };
    case actionTypeActivationContext.fetchError:
      return {
        ...state,
        submitError: (action as IChangePasswordSubmitErrorAction).message!,
        contextState: ContextState.Failed
      };
    case actionTypeChangePasswordSubmit.requested:
      return {
        ...state,
        submitted: (action as IChangePasswordSubmitRequestedAction).model,
        submitState: SubmitState.Loading,
        submitError: ""
      };
    case actionTypeChangePasswordSubmit.received:
      return {
        ...state,
        isPerforming: false,
        submitState: SubmitState.Success,
        submitError: "",
      };
    case actionTypeChangePasswordSubmit.fetchError:
      return {
        ...state,
        submitError: (action as IChangePasswordSubmitErrorAction).message || "",
        submitState: SubmitState.Failed
      };
    case actionTypeChangePasswordReset:
      return {
        ...state,
        submitted: stateDefault.submitted
      }
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return stateDefault;
    default:
      return state;
  }
};
export default changePasswordReducer;
