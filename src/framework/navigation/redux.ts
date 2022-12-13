import { IGlobalState, Reducers } from '~/app/store';
import createReducer from '~/framework/util/redux/reducerFactory';

// State type
export interface StartupState {
  isReady: boolean;
}

// Initial state
export const initialState: StartupState = {
  isReady: false,
};

// Action types
export const actionTypes = {
  ready: 'APP_READY',
};

export const reducer = createReducer(initialState, {
  [actionTypes.ready]: (state, action) => {
    return {
      ...state,
      isReady: true,
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
