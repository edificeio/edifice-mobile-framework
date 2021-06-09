import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../../../infra/redux/async2";
import viescoConfig from "../../moduleConfig";

// THE MODEL --------------------------------------------------------------------------------------

export interface IDevoir {
  teacher: string;
  date: moment.Moment;
  title: string;
  matiere: string;
  diviseur: number;
  coefficient: string;
  note: string;
  moyenne: string;
  competences: {
    nom: string;
    id: number;
    id_devoir: number;
    id_eleve: string;
    id_competence: number;
    evaluation: number;
  }[];
}

export type IDevoirList = IDevoir[];

// THE STATE --------------------------------------------------------------------------------------

export type IDevoirListState = AsyncState<IDevoirList>;

export const initialState: IDevoirList = [];

export const getDevoirListState = (globalState: any) =>
  viescoConfig.getState(globalState).competences.devoirsList as IDevoirListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType("COMPETENCES_DEVOIR_LIST"));
