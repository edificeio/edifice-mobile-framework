import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface IMoyenne {
  matiere: string;
  note: number;
  total: number;
  teacher: string;
  moySousMatiere: { matiere: string; note: number; total: number }[];
}

export type IMoyenneList = IMoyenne[];

// THE STATE --------------------------------------------------------------------------------------

export type IMoyenneListState = AsyncState<IMoyenneList>;

export const initialState: IMoyenneList = [];

export const getMoyenneListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).moyennesList as IMoyenneListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.createActionType("COMPETENCES_MOYENNE_LIST"));
