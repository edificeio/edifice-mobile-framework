import viescoConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { AsyncActionTypes, AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';

// THE MODEL --------------------------------------------------------------------------------------

export interface IPersonnel {
  displayName: string;
  firstName: string;
  id: string;
  lastName: string;
}

export type IPersonnelList = IPersonnel[];

// THE STATE --------------------------------------------------------------------------------------

export type IPersonnelListState = AsyncState<IPersonnelList>;

export const initialState: IPersonnelList = [];

export const getPersonnelListState = (globalState: any) => viescoConfig.getState(globalState).personnelList as IPersonnelListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('PERSONNEL_LIST'));
