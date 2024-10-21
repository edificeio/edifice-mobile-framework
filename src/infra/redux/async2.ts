import { AnyAction, Reducer } from 'redux';

import createReducer, { createSessionReducer, IReducerActionsHandlerMap } from './reducerFactory';

// Action Types

export type AsyncActionTypeKey = 'request' | 'receipt' | 'error' | 'clear';
export type AsyncActionTypes = { [key in AsyncActionTypeKey]: string };

const asyncActionTypeSuffixes: AsyncActionTypes = {
  clear: '_CLEAR',
  error: '_ERROR',
  receipt: '_RECEIPT',
  request: '_REQUEST',
};

export type AsyncActionCreators<DataType> = {
  request: () => AnyAction;
  receipt: (data: DataType) => ReceiptAction<DataType>;
  error: (err: Error) => ErrorAction;
  clear: () => AnyAction;
};

export const createAsyncActionTypes: (prefixUpperCase: string) => AsyncActionTypes = (prefixUpperCase: string) => {
  const ret = {} as AsyncActionTypes;
  for (const entryName in asyncActionTypeSuffixes) {
    ret[entryName] = prefixUpperCase + asyncActionTypeSuffixes[entryName];
  }
  return ret;
};

export const createAsyncActionCreators: <DataType>(actionTypes: AsyncActionTypes) => AsyncActionCreators<DataType> = <DataType>(
  actionTypes: AsyncActionTypes,
) => ({
  clear: () => ({ type: actionTypes.clear }),
  error: (error: Error) => ({ error, type: actionTypes.error }),
  receipt: (data: DataType) => ({ data, type: actionTypes.receipt }),
  request: () => ({ type: actionTypes.request }),
});

// State

export interface AsyncState<DataType> {
  data: DataType;
  isPristine: boolean;
  isFetching: boolean;
  error?: Error;
}

export function createInitialState<DataType>(initialState: DataType) {
  return {
    data: initialState,
    error: undefined,
    isFetching: false,
    isPristine: true,
  };
}

// Reducer

export interface ReceiptAction<DataType> extends AnyAction {
  data: DataType;
}

export interface ErrorAction extends AnyAction {
  error: Error;
}

function _createAsyncReducer<DataType>(
  initialState: DataType,
  actionTypes: AsyncActionTypes,
  reducerActionsHandlerMap: IReducerActionsHandlerMap<DataType> = {},
  createReducerFunction: <StateType>(
    initialState: StateType,
    reducerActionsHandlerMap: IReducerActionsHandlerMap<StateType>,
    ...args: any[]
  ) => Reducer<StateType, AnyAction>,
  createReducerFunctionAdditionalArgs: any[] = [],
): Reducer<AsyncState<DataType>> {
  const asyncInitialState = createInitialState(initialState);
  const dataReducer = createReducer(initialState, reducerActionsHandlerMap);
  const asyncReducer = createReducerFunction<AsyncState<DataType>>(
    asyncInitialState,
    {
      [actionTypes.request]: (state, action) => ({
        ...state,
        isFetching: true,
      }),
      [actionTypes.receipt]: (state, action: ReceiptAction<DataType>) => ({
        ...state,
        data: action.data,
        isFetching: false,
        isPristine: false,
      }),
      [actionTypes.error]: (state, action: ErrorAction) => ({
        ...state,
        error: action.error,
        isFetching: false,
      }),
      [actionTypes.clear]: () => asyncInitialState,
    } as IReducerActionsHandlerMap<AsyncState<DataType>>,
    ...createReducerFunctionAdditionalArgs,
  );

  return (state = asyncInitialState, action) =>
    asyncReducer(
      {
        ...(state as AsyncState<DataType>),
        data: dataReducer(state.data, action),
      },
      action,
    );
}

export function createAsyncReducer<DataType>(
  initialState: DataType,
  actionTypes: AsyncActionTypes,
  reducerActionsHandlerMap?: IReducerActionsHandlerMap<DataType>,
): Reducer<AsyncState<DataType>> {
  return _createAsyncReducer(initialState, actionTypes, reducerActionsHandlerMap, createReducer);
}

export function createSessionAsyncReducer<DataType>(
  initialState: DataType,
  actionTypes: AsyncActionTypes,
  reducerActionsHandlerMap?: IReducerActionsHandlerMap<DataType>,
  sessionNamesUppercase?: string[],
): Reducer<AsyncState<DataType>> {
  return _createAsyncReducer(initialState, actionTypes, reducerActionsHandlerMap, createSessionReducer, [sessionNamesUppercase]);
}
