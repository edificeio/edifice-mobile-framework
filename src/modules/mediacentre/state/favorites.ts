import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';
import { Resource } from '~/modules/mediacentre/utils/Resource';
import mediacentreConfig from '~/modules/mediacentre/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export type IFavorites = Resource[];

// THE STATE --------------------------------------------------------------------------------------

export type IFavoritesState = AsyncState<IFavorites>;

export const initialState: IFavorites = [];

export const getFavoritesState = (globalState: any) => mediacentreConfig.getState(globalState).favorites as IFavoritesState

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mediacentreConfig.namespaceActionType('MEDIACENTRE_FAVORITES'));
