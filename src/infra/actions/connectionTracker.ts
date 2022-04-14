import NetInfo from '@react-native-community/netinfo';

let isWatching = false;
let wasDisconnected = false;

const handleConnection = (isConnected, dispatch) => {
  if (isConnected) {
    dispatch({ type: 'CONNECTED_CONNECTION_TRACKER' });
    setTimeout(() => {
      dispatch({ type: 'HIDE_CONNECTION_TRACKER' });
    }, 1000);
    if (wasDisconnected) {
      dispatch({ type: 'INVALIDATE_TIMELINE' });
      dispatch({ type: 'INVALIDATE_CONVERSATION' });
      wasDisconnected = false;
    }
  } else {
    dispatch({ type: 'DISCONNECTED_CONNECTION_TRACKER' });
    dispatch({ type: 'SHOW_CONNECTION_TRACKER' });
    wasDisconnected = true;
  }
};

export const checkConnection = dispatch => () => {
  dispatch({ type: 'LOADING_CONNECTION_TRACKER' });

  NetInfo.fetch().then(state => handleConnection(state.isConnected, dispatch));
};

export const watchConnection = dispatch => () => {
  if (isWatching) {
    return;
  }
  isWatching = true;
  NetInfo.fetch().then(state => handleConnection(state.isConnected, dispatch));
  NetInfo.addEventListener(state => handleConnection(state.isConnected, dispatch));
};
