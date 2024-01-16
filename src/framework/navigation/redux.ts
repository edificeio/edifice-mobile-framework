import { IGlobalState, Reducers } from '~/app/store';
import createReducer from '~/framework/util/redux/reducerFactory';

// State type
export interface StartupState {
  isReady?: number; // Timestamp if true, undefined if false
}

// Initial state
export const initialState: StartupState = {
  isReady: undefined,
};

// Action types
export const actionTypes = {
  ready: 'APP_READY',
};

export const reducer = createReducer(initialState, {
  [actionTypes.ready]: (state, action) => {
    return {
      ...state,
      isReady: Date.now(),
    };
  },
});

export const appReadyAction = () => {
  return {
    type: actionTypes.ready,
  };
};

Reducers.register('startup', reducer);

export const getState = (state: IGlobalState) => state.startup as StartupState;
