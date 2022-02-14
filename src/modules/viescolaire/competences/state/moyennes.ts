import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

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

export type IMoyenneList = IMoyenne[];

// THE STATE --------------------------------------------------------------------------------------

export type IMoyenneListState = AsyncState<IMoyenneList>;

export const initialState: IMoyenneList = [];

export const getMoyenneListState = (globalState: any) =>
  viescoConfig.getState(globalState).competences.moyennesList as IMoyenneListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('COMPETENCES_MOYENNE_LIST'));
