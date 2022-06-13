import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import mediacentreConfig from '~/modules/mediacentre/moduleConfig';
import { IResource } from '~/modules/mediacentre/utils/Resource';

// THE MODEL --------------------------------------------------------------------------------------

export interface ISignets {
  orientationSignets: IResource[];
  sharedSignets: IResource[];
}

// THE STATE --------------------------------------------------------------------------------------

export type ISignetsState = AsyncState<ISignets>;

export const initialState: ISignets = {
  orientationSignets: [],
  sharedSignets: [],
};

export const getSignetsState = (globalState: any) => mediacentreConfig.getState(globalState).signets as ISignetsState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mediacentreConfig.namespaceActionType('MEDIACENTRE_SIGNETS'));
