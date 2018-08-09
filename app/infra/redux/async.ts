import { Dispatch } from "redux";
import { ThunkAction, ThunkDispatch } from "../../../node_modules/redux-thunk";

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
 *
 * TODO : Move this file. It's not only for homework app.
 */

export interface IAsyncReducer<T> {
  data: T;
  didInvalidate: boolean;
  isFetching: boolean;
  lastUpdated: Date;
}

// ACTIONS ----------------------------------------------------------------------------------------

/**
 * Generates a action type string by adding a suffix.
 * The suffix can be "_INVALIDATED", "_REQUESTED", "_RECEIVED", "_FETCH_ERROR".
 */
const actionTypeInvalidated = (actionPrefix: string) =>
  actionPrefix + "_INVALIDATED";

const actionTypeRequested = (actionPrefix: string) =>
  actionPrefix + "_REQUESTED";

const actionTypeReceived = (actionPrefix: string) => actionPrefix + "_RECEIVED";

const actionTypeFetchError = (actionPrefix: string) =>
  actionPrefix + "_FETCH_ERROR";

export interface IAsyncActionTypes {
  invalidated: string;
  requested: string;
  received: string;
  fetchError: string;
}

/**
 * Generates four action types to manage async data flow.
 * @param actionPrefix base type for all generated action types.
 */
export const asyncActionTypes: (
  actionPrefix: string
) => IAsyncActionTypes = actionPrefix => ({
  fetchError: actionTypeFetchError(actionPrefix),
  invalidated: actionTypeInvalidated(actionPrefix),
  received: actionTypeReceived(actionPrefix),
  requested: actionTypeRequested(actionPrefix)
});

/**
 * Returns if data should be fetched again from the server.
 * @param state the asyncReducer state.
 */
export const shouldFetch: (state: IAsyncReducer<any>) => boolean = state => {
  // console.log("should fetch ?", state);
  if (state === undefined) return true;
  if (state.isFetching) {
    return false;
  } else return state.didInvalidate;
};

export const asyncFetchJson: <DataTypeBackend, DataType>(
  uri: string,
  adapter: (data: DataTypeBackend) => DataType,
  opts: object
) => Promise<DataType> = async (uri, adapter, opts) => {
  const response = await fetch(uri, opts);
  const json = (await response.json()) as any;
  return adapter(json);
};

export const asyncGetJson: <DataTypeBackend, DataType>(
  uri: string,
  adapter: (data: DataTypeBackend) => DataType
) => Promise<DataType> = async (uri, adapter) => {
  const response = await fetch(uri, {
    method: "get"
  });
  const json = (await response.json()) as any;
  return adapter(json);
};

/**
 * Returns a thunk that fetch async data if needed. Condition to fetch or not is determined by the shouldFetch() function, which uses the asyn values (didInvalidate).
 * @param localState function to get the localState fro mthe globalState.
 * @param fetchFunc function to fetch data. Must return a value that could be directely put into the reducer data.
 * @param args optional - additional arguments to be passed to the fetchFunc.
 */
export const asyncFetchIfNeeded: <
  DataType = any,
  StateType extends IAsyncReducer<DataType> = IAsyncReducer<DataType>
>(
  localState: (globalState: any) => StateType,
  fetchFunc: (...args: any[]) => DataType,
  ...args: any[]
) => any = (localState, fetchFunc, ...args) => {
  return (dispatch, getState) => {
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
export default function asyncReducer<T>(
  dataReducer: (state?: T, action?: any) => T,
  actionTypes: IAsyncActionTypes
) {
  return (
    state: IAsyncReducer<T> = {
      data: undefined, // Set by homework.diaryList reducer.
      didInvalidate: true,
      isFetching: false,
      lastUpdated: null
    },
    action: { type: string; receivedAt?: Date; data?: T }
  ) => {
    // Reducing
    switch (action.type) {
      case actionTypes.invalidated:
        return {
          ...state,
          data: dataReducer(state.data, action),
          didInvalidate: true
        };
      case actionTypes.requested:
        return {
          ...state,
          data: dataReducer(state.data, action),
          didInvalidate: false,
          isFetching: true
        };
      case actionTypes.received:
        return {
          ...state,
          data: dataReducer(state.data, action),
          didInvalidate: false,
          isFetching: false,
          lastUpdated: action.receivedAt
        };
      case actionTypes.fetchError:
        return {
          ...state,
          data: dataReducer(state.data, action),
          didInvalidate: true,
          isFetching: false
        };
      default:
        return state; // TODO call dataReducer here too ?
    }
  };
}
