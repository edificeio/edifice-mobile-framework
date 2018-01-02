import { CREATE_SUCCESS, CREATE_ERROR } from "../constants/docs"
import {matchs, PATH_LOGIN, PATH_LOGOUT, PATH_SIGNUP} from "../constants/paths"

const initialState: AuthProps = {
	email: "",
	password: "",
	loggedIn: false,
	synced: false,
}

export interface AuthProps {
	email: string
	password: string
	loggedIn: boolean
	synced: boolean
}

export function Auth(state: AuthProps = initialState, action): AuthProps {
	if (matchs([PATH_LOGIN, PATH_SIGNUP], action.path) && action.type === CREATE_SUCCESS) {
		const newState = { ...state }

		newState.email = action.payload.email
		newState.password = action.payload.password
		newState.loggedIn = true
		newState.synced = true

		return newState
	}

    if (matchs([PATH_LOGOUT], action.path)) {
        return {...initialState, email: action.payload.email, synced: true, loggedIn: false}
    }

    if (matchs([PATH_LOGIN, PATH_SIGNUP], action.path) && action.type === CREATE_ERROR) {
        const newState = { ...state }

        newState.email = action.payload.email
        newState.password = action.payload.password
        newState.loggedIn = false
        newState.synced = true

        return newState
    }

	return state
}
