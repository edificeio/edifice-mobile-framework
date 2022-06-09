import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import mediacentreConfig from '~/modules/mediacentre/moduleConfig';
import { IResource } from '~/modules/mediacentre/utils/Resource';

// THE MODEL --------------------------------------------------------------------------------------

export type ISearch = IResource[];

// THE STATE --------------------------------------------------------------------------------------

export type ISearchState = AsyncState<ISearch>;

export const initialState: ISearch = [];

export const getSearchState = (globalState: any) => mediacentreConfig.getState(globalState).search as ISearchState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mediacentreConfig.namespaceActionType('MEDIACENTRE_SEARCH'));
