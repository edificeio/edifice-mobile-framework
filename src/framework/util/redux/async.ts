import moment, { Moment } from "moment";
import { Reducer, AnyAction } from "redux";
import createReducer, { IReducerActionsHandlerMap, createSessionReducer } from "./reducerFactory";

// Action Types

export type AsyncActionTypeKey = 'request' | 'receipt' | 'error' | 'clear';
export type AsyncActionTypes = { [key in AsyncActionTypeKey]: string };

export const asyncActionTypeSuffixes: AsyncActionTypes = {
  'request': '_REQUEST',
  'receipt': '_RECEIPT',
  'error': '_ERROR',
  'clear': '_CLEAR'
}

export type AsyncActionCreators<DataType> = {
  'request': () => AnyAction,
  'receipt': (data: DataType) => ReceiptAction<DataType>,
  'error': (err: Error) => ErrorAction,
  'clear': () => AnyAction
};

export const createAsyncActionTypes: (prefixUpperCase: string) => AsyncActionTypes =
  (prefixUpperCase: string) =>
    Object.fromEntries(Object.entries(asyncActionTypeSuffixes).map(entry => {
      entry[1] = prefixUpperCase + entry[1];
      return entry;
    })) as AsyncActionTypes;

export const createAsyncActionCreators: <DataType>(actionTypes: AsyncActionTypes) => AsyncActionCreators<DataType> =
  <DataType>(actionTypes: AsyncActionTypes) => ({
    'request': () => ({ type: actionTypes.request }),
    'receipt': (data: DataType) => ({ type: actionTypes.receipt, data }),
    'error': (error: Error) => ({ type: actionTypes.error, error }),
    'clear': () => ({ type: actionTypes.clear }),
  });

// State

export interface AsyncState<DataType> {
  data: DataType;
  isPristine: boolean;
  isFetching: boolean;
  lastSuccess?: Moment;
  error?: Error;
}

export enum AsyncLoadingState {
  PRISTINE,           // When no data has been fetched yet
  INIT,               // When data is fetching for the first time
  INIT_FAILED,        // When the first-time fetch failed
  RETRY,              // When we fetch again after a faling first-time fetch
  REFRESH,            // When we refresh the list
  REFRESH_FAILED,     // When the refresh has failed
  DONE,               // When the last fetch has been successful
};

export function createInitialAsyncState<DataType>(initialState: DataType) {
  return ({
    data: initialState,
    isPristine: true,
    isFetching: false,
    error: undefined,
    lastSuccess: undefined
  });
}

// Reducer

export interface ReceiptAction<DataType> extends AnyAction {
  data: DataType
}

export interface ErrorAction extends AnyAction {
  error: Error
}

function _createAsyncReducer<DataType>(
  initialState: DataType,
  actionTypes: AsyncActionTypes,
  reducerActionsHandlerMap: IReducerActionsHandlerMap<DataType> = {},
  createReducerFunction: <StateType>(initialState: StateType, reducerActionsHandlerMap: IReducerActionsHandlerMap<StateType>, ...args: any[]) => Reducer<StateType, AnyAction>,
  createReducerFunctionAdditionalArgs: any[] = []
): Reducer<AsyncState<DataType>> {
  const asyncInitialState = createInitialAsyncState(initialState);
  const dataReducer = createReducer(initialState, reducerActionsHandlerMap);
  const asyncReducer = createReducerFunction<AsyncState<DataType>>(asyncInitialState, {
    [actionTypes.request]: (state, action) => ({
      ...state,
      isFetching: true
    }),
    [actionTypes.receipt]: (state, action: ReceiptAction<DataType>) => ({
      ...state,
      isFetching: false,
      isPristine: false,
      lastSuccess: moment(),
      data: action.data
    }),
    [actionTypes.error]: (state, action: ErrorAction) => ({
      ...state,
      isFetching: false,
      error: action.error
    }),
    [actionTypes.clear]: () =>
      asyncInitialState
  } as IReducerActionsHandlerMap<AsyncState<DataType>>,
    ...createReducerFunctionAdditionalArgs);

  return (state = asyncInitialState, action) => asyncReducer({
    ...state as AsyncState<DataType>,
    data: dataReducer(state.data, action)
  }, action);
}

export function createAsyncReducer<DataType>(
  initialState: DataType,
  actionTypes: AsyncActionTypes,
  reducerActionsHandlerMap?: IReducerActionsHandlerMap<DataType>
): Reducer<AsyncState<DataType>> {
  return _createAsyncReducer(initialState, actionTypes, reducerActionsHandlerMap, createReducer);
}

export function createSessionAsyncReducer<DataType>(
  initialState: DataType,
  actionTypes: AsyncActionTypes,
  reducerActionsHandlerMap?: IReducerActionsHandlerMap<DataType>,
  sessionNamesUppercase?: string[]
): Reducer<AsyncState<DataType>> {
  return _createAsyncReducer(initialState, actionTypes, reducerActionsHandlerMap, createSessionReducer, [sessionNamesUppercase]);
}
