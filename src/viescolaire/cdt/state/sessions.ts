import moment from "moment";

import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface ISession {
  id: number;
  date: moment.Moment;
  subject_id: string;
  start_time: string;
}

export type ISessionList = ISession[];

// THE STATE --------------------------------------------------------------------------------------

export type ISessionListState = AsyncState<ISessionList>;

export const initialState: ISessionList = [];

export const getSessionsListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).cdt.sessionsList as ISessionListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes : AsyncActionTypes = createAsyncActionTypes(viescoConfig.createActionType("CDT_SESSION_LIST"));
