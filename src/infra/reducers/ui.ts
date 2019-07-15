const getStatusBarHeight = () => 20; // ToDo use react navigation iPhone X support here

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