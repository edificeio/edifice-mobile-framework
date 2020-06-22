import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface IPersonnel {
  displayName: string;
  firstName: string;
  id: string;
  lastName: string;
}

export type IPersonnelList = IPersonnel[];

// THE STATE --------------------------------------------------------------------------------------

export type IPersonnelListState = AsyncState<IPersonnelList>;

export const initialState: IPersonnelList = [];

export const getPersonnelListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).viesco.personnelList as IPersonnelListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes : AsyncActionTypes = createAsyncActionTypes(viescoConfig.createActionType("PERSONNEL_LIST"));
