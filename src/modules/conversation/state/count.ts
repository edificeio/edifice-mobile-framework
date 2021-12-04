import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';
import folderConfig from '~/modules/conversation/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface ICountMailboxes {
  [name: string]: number;
}

// THE STATE --------------------------------------------------------------------------------------

export type ICountListState = AsyncState<ICountMailboxes>;

export const initialState = {};

export const getCountListState = (globalState: any) => folderConfig.getState(globalState).count as ICountListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(folderConfig.namespaceActionType('COUNT_LIST'));
