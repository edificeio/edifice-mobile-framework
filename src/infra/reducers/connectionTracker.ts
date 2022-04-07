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

export default (state: ConnectionTrackerState = initialState, action): ConnectionTrackerState => {
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
