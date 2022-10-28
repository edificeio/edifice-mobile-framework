/**
 * Competences Reducer
 */
import { combineReducers } from 'redux';

import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/viescolaire/competences/moduleConfig';

// Types

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

export interface IDevoirsMatieres {
  devoirs: IDevoir[];
  matieres: IMatiere[];
}

export interface ILevel {
  couleur: string;
  cycle: string;
  default: string;
  default_lib: string;
  id: number;
  id_cycle: number;
  id_etablissement: string;
  id_niveau: number;
  lettre: string;
  libelle: string;
  ordre: number;
}

export interface IMoyenne {
  matiere: string;
  matiere_coeff: number;
  matiere_rank: number;
  teacher: string;
  moyenne: string;
  devoirs: {
    note: string;
    diviseur: number;
    name: string;
    coefficient: number;
    is_evaluated: boolean;
    libelle_court: string;
  }[];
}

export interface IUserChild {
  displayName: string;
  firstName: string;
  id: string;
  idClasse: string;
  idStructure: string;
  lastName: string;
}

// State

interface ICompetences_StateData {
  devoirsMatieres: IDevoirsMatieres;
  levels: ILevel[];
  moyennes: IMoyenne[];
  userChildren: IUserChild[];
}

export interface ICompetences_State {
  devoirsMatieres: AsyncState<IDevoirsMatieres>;
  levels: AsyncState<ILevel[]>;
  moyennes: AsyncState<IMoyenne[]>;
  userChildren: AsyncState<IUserChild[]>;
}
// Reducer

const initialState: ICompetences_StateData = {
  devoirsMatieres: {
    devoirs: [],
    matieres: [],
  },
  levels: [],
  moyennes: [],
  userChildren: [],
};

export const actionTypes = {
  devoirsMatieres: createAsyncActionTypes(moduleConfig.namespaceActionType('DEVOIRS_MATIERES')),
  levels: createAsyncActionTypes(moduleConfig.namespaceActionType('LEVELS')),
  moyennes: createAsyncActionTypes(moduleConfig.namespaceActionType('MOYENNES')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

export default combineReducers({
  devoirsMatieres: createSessionAsyncReducer(initialState.devoirsMatieres, actionTypes.devoirsMatieres),
  levels: createSessionAsyncReducer(initialState.levels, actionTypes.levels),
  moyennes: createSessionAsyncReducer(initialState.moyennes, actionTypes.moyennes),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});
