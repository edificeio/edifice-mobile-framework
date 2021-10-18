import { UI_SIZES } from "../../framework/components/constants";

const getStatusBarHeight = () => 20; // ToDo use react navigation iPhone X support here

interface UiState{
    headerHeight: number
}

const initialState = {
    headerHeight: UI_SIZES.headerHeight + getStatusBarHeight()
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