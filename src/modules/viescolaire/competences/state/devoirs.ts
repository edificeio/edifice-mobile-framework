import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../../../infra/redux/async2";
import viescoConfig from "../../moduleConfig";

// THE MODEL --------------------------------------------------------------------------------------

export interface IMatiere {
  id: string;
  externalId: string;
  name: string;
}

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

export type IMatiereList = IMatiere[];

export interface IDevoirsMatieres {
  devoirs: IDevoirList;
  matieres: IMatiereList;
}

// THE STATE --------------------------------------------------------------------------------------

export type IDevoirsMatieresState = AsyncState<IDevoirsMatieres>;

export const initialState: IDevoirsMatieres = {
  devoirs: [],
  matieres: [],
};

export const getDevoirListState = (globalState: any) =>
  viescoConfig.getState(globalState).competences.devoirsMatieres as IDevoirsMatieresState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType("COMPETENCES_DEVOIR_MATIERES"));
