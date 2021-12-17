/* eslint-disable flowtype/no-types-missing-file-annotation */
import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/config';

// THE MODEL --------------------------------------------------------------------------------------

export interface IService {
  id_matiere: string;
  evaluable: boolean;
  id_groups: string[];
}

export type IServiceList = IService[];

// THE STATE --------------------------------------------------------------------------------------

export type IServiceListState = AsyncState<IServiceList>;

export const initialState: IServiceList = [];

export const getServiceListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).competences.serviceList as IServiceListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.createActionType('COMPETENCES_SERVICES'));
