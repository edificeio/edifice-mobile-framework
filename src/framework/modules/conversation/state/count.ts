import folderConfig from '~/framework/modules/conversation/module-config';
import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';

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
