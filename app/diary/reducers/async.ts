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
 * TODO : Move this. It's not only for diary app.
 */

export const actionTypeInvalidated = (actionPrefix: string) =>
  actionPrefix + "_INVALIDATED";

export const actionTypeRequested = (actionPrefix: string) =>
  actionPrefix + "_REQUESTED";

export const actionTypeReceived = (actionPrefix: string) =>
  actionPrefix + "_RECEIVED";

export const actionTypeFetchError = (actionPrefix: string) =>
  actionPrefix + "_FETCH_ERROR";

export interface IAsyncReducer<T> {
  data: T;
  didInvalidate: boolean;
  isFetching: boolean;
  lastUpdated: Date;
}

export default function asyncReducer<T>(
  dataReducer: (state?: T, action?: any) => T,
  actionPrefix: string
) {
  // Computed action names
  const actionInvalidated = actionTypeInvalidated(actionPrefix);
  const actionRequested = actionTypeRequested(actionPrefix);
  const actionReceived = actionTypeReceived(actionPrefix);
  const actionFetchError = actionTypeFetchError(actionPrefix);

  // Reducer
  return (
    state: {
      data: T;
      didInvalidate: boolean;
      isFetching: boolean;
      lastUpdated: Date;
    } = {
      data: undefined, // Set by diary.list reducer.
      didInvalidate: true,
      isFetching: false,
      lastUpdated: null
    },
    action: { type: string; receivedAt?: Date; data?: T }
  ) => {
    // Reducing
    switch (action.type) {
      case actionInvalidated:
        return {
          ...state,
          data: dataReducer(state.data, action),
          didInvalidate: true
        };
      case actionRequested:
        return {
          ...state,
          data: dataReducer(state.data, action),
          didInvalidate: false,
          isFetching: true
        };
      case actionReceived:
        return {
          ...state,
          data: dataReducer(state.data, action),
          didInvalidate: false,
          isFetching: false,
          lastUpdated: action.receivedAt
        };
      case actionFetchError:
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
