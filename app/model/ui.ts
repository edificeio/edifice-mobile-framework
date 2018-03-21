import { getStatusBarHeight } from 'react-native-status-bar-height';

interface UiState{
    headerHeight: number
}

const initialState = {
    headerHeight: 56 + getStatusBarHeight()
}

export default (state: UiState = initialState, action): UiState => {
	if(action.type === 'SET_HEADER_HEIGHT_UI'){
		return {
			...state,
			headerHeight: action.height + getStatusBarHeight()
		}
    }
    
    return { ...state }
}