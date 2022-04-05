import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';
import { Resource } from '~/modules/mediacentre/utils/Resource';
import mediacentreConfig from '~/modules/mediacentre/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export type ISearch = Resource[];

// THE STATE --------------------------------------------------------------------------------------

export type ISearchState = AsyncState<ISearch>;

export const initialState: ISearch = [];

export const getSearchState = (globalState: any) => mediacentreConfig.getState(globalState).search as ISearchState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mediacentreConfig.namespaceActionType('MEDIACENTRE_SEARCH'));
