import { CREATE_SUCCESS } from "../constants/docs"
import { matchs, PATH_LOGIN } from "../constants/paths"

const initialState: AuthProps = {
	email: "",
	password: "",
	loggedIn: false,
	synced: true,
}

export interface AuthProps {
	email: string
	password: string
	loggedIn: boolean
	synced: boolean
}

export function Auth(state: AuthProps = initialState, action): AuthProps {
	if (matchs([PATH_LOGIN], action.path) && action.type === CREATE_SUCCESS) {
		const newState = { ...state }

		newState.email = action.payload.email
		newState.password = action.payload.password
		newState.loggedIn = true
		newState.synced = true

		return newState
	}

	return state
}
