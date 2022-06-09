import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import mediacentreConfig from '~/modules/mediacentre/moduleConfig';
import { IResource } from '~/modules/mediacentre/utils/Resource';

// THE MODEL --------------------------------------------------------------------------------------

export type IExternals = IResource[];

// THE STATE --------------------------------------------------------------------------------------

export type IExternalsState = AsyncState<IExternals>;

export const initialState: IExternals = [];

export const getExternalsState = (globalState: any) => mediacentreConfig.getState(globalState).externals as IExternalsState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mediacentreConfig.namespaceActionType('MEDIACENTRE_EXTERNALS'));
