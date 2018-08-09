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

// ACTIONS ----------------------------------------------------------------------------------------

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

export const asyncActionTypes: (
  actionPrefix: string
) => IAsyncActionTypes = actionPrefix => ({
  fetchError: actionTypeFetchError(actionPrefix),
  invalidated: actionTypeInvalidated(actionPrefix),
  received: actionTypeReceived(actionPrefix),
  requested: actionTypeRequested(actionPrefix)
});

export const shouldFetch: (state: IAsyncReducer<any>) => boolean = state => {
  if (!state) return true;
  if (state.isFetching) {
    return false;
  } else return state.didInvalidate;

  /*
  if (!(state && state.data)) {
    return true;
  } else if (state.isFetching) {
    return false;
  } else {
    return state.didInvalidate;
  }
  */
};

// REDUCER ----------------------------------------------------------------------------------------

export interface IAsyncReducer<T> {
  data: T;
  didInvalidate: boolean;
  isFetching: boolean;
  lastUpdated: Date;
}

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
