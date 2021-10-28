import { createAsyncActionTypes, AsyncState } from '../../../../infra/redux/async2';
import viescoConfig from '../../moduleConfig';

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
  viescoConfig.getState(globalState).presences.registerPreferences as IRegisterPreferencesState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('REGISTER_PREFERENCES'));
