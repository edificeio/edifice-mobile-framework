import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';
import { Resource } from '~/modules/mediacentre/utils/Resource';
import mediacentreConfig from '~/modules/mediacentre/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface ISignets {
  orientationSignets: Resource[];
  sharedSignets: Resource[];
}

// THE STATE --------------------------------------------------------------------------------------

export type ISignetsState = AsyncState<ISignets>;

export const initialState: ISignets = {
  orientationSignets: [],
  sharedSignets: [],
};

export const getSignetsState = (globalState: any) => mediacentreConfig.getState(globalState).signets as ISignetsState

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mediacentreConfig.namespaceActionType('MEDIACENTRE_SIGNETS'));
