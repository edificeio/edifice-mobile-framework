import { createEndSessionActionType } from '~/infra/redux/reducerFactory';
import {
  IActivationContextFetchedAction,
  IActivationContextRequestedAction,
  IActivationModel,
  IActivationSubmitErrorAction,
  IActivationSubmitRequestedAction,
  IActivationUserInfo,
  actionTypeActivationSubmit,
} from '~/user/actions/activation';
import { actionTypeActivationContext } from '~/user/actions/initActivation';
import { ContextState, SubmitState } from '~/utils/SubmitState';

import { IUserAuthContext } from '../service';

export interface IActivationState {
  isActivating: boolean;
  context: IUserAuthContext;
  userinfo: IActivationUserInfo;
  submitted: IActivationModel;
  submitState: SubmitState;
  contextState: ContextState;
  submitError: string;
}

// THE REDUCER ------------------------------------------------------------------------------------

export const stateDefault: IActivationState = {
  isActivating: false,
  context: {
    cgu: true,
    passwordRegex: /''/,
    passwordRegexI18n: {},
    mandatory: { mail: false, phone: false },
  },
  submitted: {
    phone: '',
    login: '',
    activationCode: '',
    confirm: '',
    email: '',
    password: '',
  },
  userinfo: { activationCode: '', login: '' },
  contextState: ContextState.Void,
  submitState: SubmitState.Void,
  submitError: '',
};

const activationReducer = (state: IActivationState = stateDefault, action): IActivationState => {
  switch (action.type) {
    case actionTypeActivationContext.requested:
      return {
        ...state,
        userinfo: (action as IActivationContextRequestedAction).userinfo,
        contextState: ContextState.Loading,
      };
    case actionTypeActivationContext.received:
      return {
        ...state,
        context: (action as IActivationContextFetchedAction).context,
        contextState: ContextState.Success,
        isActivating: true,
      };
    case actionTypeActivationContext.fetchError:
      return {
        ...state,
        submitError: (action as IActivationSubmitErrorAction).message,
        contextState: ContextState.Failed,
      };
    case actionTypeActivationSubmit.requested:
      return {
        ...state,
        submitted: (action as IActivationSubmitRequestedAction).model,
        submitState: SubmitState.Loading,
      };
    case actionTypeActivationSubmit.received:
      return {
        ...state,
        isActivating: false,
        submitState: SubmitState.Success,
      };
    case actionTypeActivationSubmit.fetchError:
      return {
        ...state,
        submitError: (action as IActivationSubmitErrorAction).message || '',
        submitState: SubmitState.Failed,
      };
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return stateDefault;
    default:
      return state;
  }
};
export default activationReducer;
