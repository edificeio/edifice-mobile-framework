import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface IDevoir {
  id: string;
  date: moment.Moment;
  subject: string;
  matiere: string;
  note: number
}

export type IDevoirList = IDevoir[];

// THE STATE --------------------------------------------------------------------------------------

export type IDevoirListState = AsyncState<IDevoirList>;

export const initialState: IDevoirList = [];

export const getDevoirListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).devoirsList as IDevoirListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.createActionType("COMPETENCES_DEVOIR_LIST"));
