export interface ConnectionTrackerState {
    connected: boolean,
    loading: boolean
}

const initialState = {
    connected: false,
    loading: false
}

export default (state: ConnectionTrackerState = initialState, action): ConnectionTrackerState => {
    if(action.type === 'LOADING_CONNECTION_TRACKER'){
		return {
            ...state,
            loading: true
		}
    }

	if(action.type === 'CONNECTED_CONNECTION_TRACKER'){
        console.log('connected')
		return {
            ...state,
            connected: true
		}
    }
    
    if(action.type === 'DISCONNECTED_CONNECTION_TRACKER'){
        console.log('disconnected')
		return {
            ...state,
            connected: false
		}
    }
    
    return state;
}
