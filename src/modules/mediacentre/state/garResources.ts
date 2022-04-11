import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import mediacentreConfig from '~/modules/mediacentre/moduleConfig';
import { Resource } from '~/modules/mediacentre/utils/Resource';

// THE MODEL --------------------------------------------------------------------------------------

export type IGarResources = Resource[];

// THE STATE --------------------------------------------------------------------------------------

export type IGarResourcesState = AsyncState<IGarResources>;

export const initialState: IGarResources = [];

export const getGarResourcesState = (globalState: any) =>
  mediacentreConfig.getState(globalState).garResources as IGarResourcesState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mediacentreConfig.namespaceActionType('MEDIACENTRE_GAR_RESOURCES'));
