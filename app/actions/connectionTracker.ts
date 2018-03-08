import { NetInfo } from "react-native";

let isWatching = false;

export const watchConnection = dispatch => () => {
    if(isWatching){
        return;
    }

    isWatching = true;
    NetInfo.isConnected.fetch().then(isConnected => isConnected ? 
        dispatch({ type: 'CONNECTED_CONNECTION_TRACKER'}) : 
        dispatch({ type: 'DISCONNECTED_CONNECTION_TRACKER'})
    );
    NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => isConnected ? 
        dispatch({ type: 'CONNECTED_CONNECTION_TRACKER'}) : 
        dispatch({ type: 'DISCONNECTED_CONNECTION_TRACKER'})
    );
}