import { READ_SUCCESS } from "../constants/docs"
import { matchs, PATH_AVATAR } from "../constants/paths"

interface AvatarsModel {
	[index: string]: string
}

const initialState = {}

export const Avatars = (state: AvatarsModel = initialState, action): AvatarsModel => {
	if (matchs([PATH_AVATAR], action.path) && action.type === READ_SUCCESS) {
		const newState = { ...state }

		newState[action.id] = action.payload

		return newState
	}
	return state
}
