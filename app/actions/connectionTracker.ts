import { NetInfo } from "react-native";

let isWatching = false;

const handleConnection = (isConnected, dispatch) => {
    if(isConnected){
        dispatch({ type: 'CONNECTED_CONNECTION_TRACKER'});
        setTimeout(() => {
            dispatch({ type: 'HIDE_CONNECTION_TRACKER'});
        }, 1000);
    }
    else{
        dispatch({ type: 'DISCONNECTED_CONNECTION_TRACKER'});
        dispatch({ type: 'SHOW_CONNECTION_TRACKER'});
    }
    
}

export const checkConnection = dispatch => () => {
    dispatch({ type: 'LOADING_CONNECTION_TRACKER'});

    NetInfo.isConnected.fetch().then(isConnected => handleConnection(isConnected, dispatch));
}

export const watchConnection = dispatch => () => {
    if(isWatching){
        return;
    }

    isWatching = true;
    NetInfo.isConnected.fetch().then(isConnected => handleConnection(isConnected, dispatch));
    NetInfo.isConnected.addEventListener('connectionChange', isConnected => handleConnection(isConnected, dispatch));
}