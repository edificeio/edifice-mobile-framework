/* eslint-disable flowtype/no-types-missing-file-annotation */
import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface IUserChild {
  classes: string[];
  displayName: string;
  firstName: string;
  lastName: string;
  id: string;
  idClasses: string;
}

export type IUserChildren = IUserChild[];

// THE STATE --------------------------------------------------------------------------------------

export type IUserChildrenState = AsyncState<IUserChildren>;

export const initialState: IUserChildren = [];

export const getUserChildrenState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).edt.userChildren as IUserChildrenState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.createActionType("EDT_USER_CHILDREN"));
