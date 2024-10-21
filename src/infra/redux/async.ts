import { Reducer } from 'redux';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';

// OBSOLETE.

/**
 * Async iterable reducer constructor.
 *
 * Creates a custom reducer embracing an iterable data structure (on array or object that accepts the spread (...) operator).
 * The resulting reducer will contain that custom data structure as his `data` property, with three additional properties :
 * - didInvalidate (boolean) : stores whenever the data needs to be fetched again.
 * - isFetching (boolean) : is data already fetching from API ?
 * - lastUpdated (Date | null) : last time data was received, or null if data wasn't received yet.
 * Initially, didInvalidate is set to true, isFetching to false, and lastUpdated to null.
 *
 * @param dataReducer reducer function which will be called with every action dispatch. At least, it must return a brand new copy of your custom data.
 * @param actionPrefix prix for action names. Generated action names will be `<prefix>_INVALIDATED`, `<prefix>_REQUESTED`, `<prefix>_RECEIVED`, `<prefix>_FETCH_ERROR`. Should be uppercase and past time.
 *
 * Use actionTypeInvalidated, actionTypeRequested, actionTypeReceived, actionTypeFetchError action types generators to build your actions objects.
 *
 * /!\ Action MUST have a `type` attribute.
 * When the type is actionTypeReceived(), it must have also a `receivedAt` with a Date as its value.
 * Use the `dataReducer` argument to update your state when actionTypeReceived() is dispatched.
 */

// TYPE DEFINITIONS ----------------------------------------------------------------------------------------

export interface IAction<T> {
  errmsg?: string;
  type: string;
  receivedAt?: Date;
  data: T;
  payload?: any;
}

export interface IState<T> {
  data: T | undefined;
  didInvalidate: boolean;
  isFetching: boolean;
  lastUpdated: Date | null;
}

export interface IAsyncActionTypes {
  invalidated: string;
  requested: string;
  received: string;
  fetchError: string;
}

// ACTIONS, ACTION GENERATOR & THUNKS -------------------------------------------------------------

/**
 * Generates a action type string by adding a suffix.
 * The suffix can be "_INVALIDATED", "_REQUESTED", "_RECEIVED", "_FETCH_ERROR".
 */
const actionTypeInvalidated = (actionPrefix: string) => actionPrefix + '_INVALIDATED';

const actionTypeRequested = (actionPrefix: string) => actionPrefix + '_REQUESTED';

const actionTypeReceived = (actionPrefix: string) => actionPrefix + '_RECEIVED';

const actionTypeFetchError = (actionPrefix: string) => actionPrefix + '_FETCH_ERROR';

/**
 * Generates four action types to manage async data flow.
 * @param actionPrefix base type for all generated action types.
 */
export const asyncActionTypes: (actionPrefix: string) => IAsyncActionTypes = actionPrefix => ({
  fetchError: actionTypeFetchError(actionPrefix),
  invalidated: actionTypeInvalidated(actionPrefix),
  received: actionTypeReceived(actionPrefix),
  requested: actionTypeRequested(actionPrefix),
});

/**
 * Returns if data should be fetched again from the server.
 * @param state the asyncReducer state.
 */
export const shouldFetch: (state: IState<any>) => boolean = state => {
  if (state === undefined) return true;
  if (state.isFetching) {
    return false;
  } else return state.didInvalidate;
};

/**
 * Perform a fetch operation that recieve a JSON object as response.
 * @param uri
 * @param adapter function to transform the JSON receivec from the backend to the shape used in reducer.
 * @param opts fetch options used by the Fetch API.
 */
export const asyncFetchJson: <DataTypeBackend, DataType>(
  uri: string,
  adapter: (data: DataTypeBackend) => DataType,
  opts: object
) => Promise<DataType> = async (uri, adapter, opts) => {
  const json = (await fetchJSONWithCache(uri, opts)) as any;
  return adapter(json);
};

/**
 * Performs a fetch operation to GET a JSON object from the server.
 * @param uri
 * @param adapter function to transform the received JSON object into a shape used in the the reducer.
 */
export const asyncGetJson: <DataTypeBackend, DataType>(
  uri: string,
  adapter: (data: DataTypeBackend) => DataType
) => Promise<DataType> = async (uri, adapter) => {
  return asyncFetchJson(uri, adapter, { method: 'get' });
};

/**
 * Returns a thunk that fetch async data if needed. Condition to fetch or not is determined by the shouldFetch() function, which uses the asyn values (didInvalidate).
 * @param localState function to get the localState fro mthe globalState.
 * @param fetchFunc function to fetch data. Must return a value that could be directely put into the reducer data.
 * @param args optional - additional arguments to be passed to the fetchFunc.
 */
export const asyncFetchIfNeeded: <DataType = any, StateType extends IState<DataType> = IState<DataType>>(
  localState: (globalState: any) => StateType,
  fetchFunc: (...args: any[]) => DataType,
  ...args: any[]
) => any = (localState, fetchFunc, ...args) => {
  return (dispatch: any, getState: any) => {
    if (shouldFetch(localState(getState()))) {
      return dispatch(fetchFunc(...args));
    }
  };
};

// REDUCER ----------------------------------------------------------------------------------------

/**
 * Wraps a custom reducer in one that manage async data state.
 * In your custom reducer you have to write the `<action>_RECEIVED` case to put the received data in the state.
 * @param dataReducer Your custom reducer
 * @param actionTypes You have to give the action types you use for this reducer. Pass the result of asyncActionTypes().
 */
export default function asyncReducer<T>(dataReducer: Reducer<T, IAction<T>>, actionTypes: IAsyncActionTypes): Reducer<any, any> {
  return (
    state: IState<T> = {
      data: undefined, // Set by homework.diaryList reducer.
      didInvalidate: true,
      isFetching: false,
      lastUpdated: null,
    },
    action: IAction<T>
  ) => {
    // Reducing
    const data = dataReducer(state.data, action);
    switch (action.type) {
      case actionTypes.invalidated:
        return {
          ...state,
          data,
          didInvalidate: true,
        };
      case actionTypes.requested:
        return {
          ...state,
          data,
          isFetching: true,
        };
      case actionTypes.received:
        return {
          ...state,
          data,
          didInvalidate: false,
          isFetching: false,
          lastUpdated: action.receivedAt || null,
        };
      case actionTypes.fetchError:
        return {
          ...state,
          data,
          didInvalidate: true,
          isFetching: false,
        };
      default:
        return { ...state, data };
    }
  };
}
