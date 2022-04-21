import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import mediacentreConfig from '~/modules/mediacentre/moduleConfig';
import { Resource } from '~/modules/mediacentre/utils/Resource';

// THE MODEL --------------------------------------------------------------------------------------

export type ITextbooks = Resource[];

// THE STATE --------------------------------------------------------------------------------------

export type ITextbooksState = AsyncState<ITextbooks>;

export const initialState: ITextbooks = [];

export const getTextbooksState = (globalState: any) => mediacentreConfig.getState(globalState).textbooks as ITextbooksState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mediacentreConfig.namespaceActionType('MEDIACENTRE_TEXTBOOKS'));
