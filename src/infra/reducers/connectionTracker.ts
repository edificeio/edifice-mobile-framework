import { AnyAction } from 'redux';

import { IGlobalState, Reducers } from '~/app/store';

export interface ConnectionTrackerState {
  connected: boolean;
  loading: boolean;
  visible: boolean;
}

const initialState = {
  connected: false,
  loading: false,
  visible: false,
};

const reducer = (state: ConnectionTrackerState = initialState, action: AnyAction): ConnectionTrackerState => {
  if (action.type === 'SHOW_CONNECTION_TRACKER') {
    return {
      ...state,
      visible: true,
    };
  }

  if (action.type === 'HIDE_CONNECTION_TRACKER') {
    return {
      ...state,
      visible: false,
    };
  }

  if (action.type === 'LOADING_CONNECTION_TRACKER') {
    return {
      ...state,
      loading: true,
    };
  }

  if (action.type === 'CONNECTED_CONNECTION_TRACKER') {
    return {
      ...state,
      connected: true,
      loading: false,
    };
  }

  if (action.type === 'DISCONNECTED_CONNECTION_TRACKER') {
    return {
      ...state,
      connected: false,
      loading: false,
    };
  }

  return state;
};

Reducers.register('connectionTracker', reducer);

export const getState = (state: IGlobalState) => state.connectionTracker as ConnectionTrackerState;

export default reducer;
