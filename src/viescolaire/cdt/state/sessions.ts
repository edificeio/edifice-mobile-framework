import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface ISession {
  id: string;
  date: moment.Moment;
  subject: string;
  matiere: string;
}

export type ISessionList = ISession[];

// THE STATE --------------------------------------------------------------------------------------

export type ISessionListState = AsyncState<ISessionList>;

export const initialState: ISessionListState = [];

export const getDevoirListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).sessionList as ISessionListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.createActionType("CDT_SESSION_LIST"));
