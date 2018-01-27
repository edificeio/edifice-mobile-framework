import { READ_SUCCESS } from "../constants/docs"
import { matchs, PATH_AVATAR } from "../constants/paths"

interface IAvatarsModel {
	[index: string]: string
}

const initialState = {}

export const Avatars = (state: IAvatarsModel = initialState, action): IAvatarsModel => {
	if (matchs([PATH_AVATAR], action.path) && action.type === READ_SUCCESS) {
		const newState = { ...state }

		newState[action.id] = action.payload

		return newState
	}
	return state
}
