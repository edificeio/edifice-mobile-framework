import { createAsyncActionTypes, AsyncState } from "../../infra/redux/async2";
import folderConfig from "../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface ICount {
  [name: string]: number;
}

// THE STATE --------------------------------------------------------------------------------------

export type ICountListState = AsyncState<ICount>;

export const initialState = {};

export const getCountListState = (globalState: any) => folderConfig.getLocalState(globalState).count as ICountListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(folderConfig.createActionType("COUNT_LIST"));
