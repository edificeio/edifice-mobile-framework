import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import folderConfig from '~/modules/zimbra/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface ICount {
  [name: string]: number;
}

// THE STATE --------------------------------------------------------------------------------------

export type ICountListState = AsyncState<ICount>;

export const initialState = {};

export const getCountListState = (globalState: any) => folderConfig.getState(globalState).count as ICountListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(folderConfig.namespaceActionType('COUNT_LIST'));
