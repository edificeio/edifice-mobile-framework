import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface IGroup {
  idClass: string;
  idGroups: string[];
  nameClass: string;
  nameGroups: string[];
}

export type IGroupList = IGroup[];

// THE STATE --------------------------------------------------------------------------------------

export type IGroupListState = AsyncState<IGroupList>;

export const initialState: IGroupList = [];

export const getGroupsListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).viesco.group as IGroupListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.createActionType("GROUP_LIST"));
