import { Reducer, AnyAction } from "redux";
import createReducer, { IReducerActionsHandlerMap, createSessionReducer } from "./reducerFactory";

// Action Types

export type AsyncActionTypeKey = 'request' | 'receipt' | 'error';
export type AsyncActionTypes = { [key in AsyncActionTypeKey]: string };

const asyncActionTypeSuffixes: AsyncActionTypes = {
  'request': '_REQUEST',
  'receipt': '_RECEIPT',
  'error': '_ERROR'
}

export type AsyncActionCreators<DataType> = {
  'request': () => AnyAction,
  'receipt': (data: DataType) => ReceiptAction<DataType>,
  'error': (err: Error) => ErrorAction
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
    'error': (error: Error) => ({ type: actionTypes.error, error })
  });

// State

export interface AsyncState<DataType> {
  data: DataType;
  isPristine: boolean;
  isFetching: boolean;
  error?: Error;
}

function createInitialState<DataType>(initialState: DataType) {
  return ({
    data: initialState,
    isPristine: true,
    isFetching: false,
    error: undefined
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
  const asyncInitialState = createInitialState(initialState);
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
      data: action.data
    }),
    [actionTypes.error]: (state, action: ErrorAction) => ({
      ...state,
      isFetching: false,
      error: action.error
    })
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
