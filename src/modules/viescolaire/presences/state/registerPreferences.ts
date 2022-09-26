import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import moduleConfig from '~/modules/viescolaire/presences/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface IRegisterPreferences {
  preference: string;
}

// THE STATE --------------------------------------------------------------------------------------

export type IRegisterPreferencesState = AsyncState<IRegisterPreferences>;

export const initialState: IRegisterPreferences = {
  preference: '',
};

export const getRegisterPreferencesState = (globalState: any) =>
  moduleConfig.getState(globalState).registerPreferences as IRegisterPreferencesState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('REGISTER_PREFERENCES'));
