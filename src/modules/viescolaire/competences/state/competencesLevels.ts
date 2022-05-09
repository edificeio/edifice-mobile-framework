import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface ILevels {
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

export type ILevelsList = ILevels[];

// THE STATE --------------------------------------------------------------------------------------

export type ILevelsListState = AsyncState<ILevelsList>;

export const initialState: ILevelsList = [];

export const getLevelsListState = (globalState: any) => viescoConfig.getState(globalState).competences.levels as ILevelsListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('COMPETENCES_LEVELS'));
