import { createAsyncActionTypes, AsyncState } from "../../infra/redux/async2";
import supportConfig from "../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface ISupport {
  category: string;
  subject: string;
}

// THE STATE --------------------------------------------------------------------------------------

export type ISupportListState = AsyncState<ISupport>;

export const initialState = {};

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(supportConfig.createActionType("SUPPORT"));
