import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import mediacentreConfig from '~/modules/mediacentre/moduleConfig';
import { IResource } from '~/modules/mediacentre/utils/Resource';

// THE MODEL --------------------------------------------------------------------------------------

export type IFavorites = IResource[];

// THE STATE --------------------------------------------------------------------------------------

export type IFavoritesState = AsyncState<IFavorites>;

export const initialState: IFavorites = [];

export const getFavoritesState = (globalState: any) => mediacentreConfig.getState(globalState).favorites as IFavoritesState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mediacentreConfig.namespaceActionType('MEDIACENTRE_FAVORITES'));
