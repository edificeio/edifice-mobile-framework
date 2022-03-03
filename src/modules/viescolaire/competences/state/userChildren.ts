import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface IUserChild {
  displayName: string;
  firstName: string;
  id: string;
  idClasse: string;
  idStructure: string;
  lastName: string;
}

export type IUserChildren = IUserChild[];

// THE STATE --------------------------------------------------------------------------------------

export type ICompetencesUserChildrenState = AsyncState<IUserChildren>;

export const initialState: IUserChildren = [];

export const getUserChildrenState = (globalState: any) =>
  viescoConfig.getState(globalState).competences.userChildren as ICompetencesUserChildrenState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('USER_CHILDREN'));
