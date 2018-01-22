import { CREATE_SUCCESS } from "../constants/docs"
import { matchs, PATH_LOGIN, PATH_LOGOUT, PATH_SIGNUP } from "../constants/paths"

export interface AuthModel {
	email: string
	password: string
	loggedIn: boolean
	synced: boolean
}

export interface AuthState extends AuthModel {}

export const initialState: AuthState = {
	email: "",
	password: "",
	loggedIn: false,
	synced: true,
}

export function Auth(state: AuthState = initialState, action): AuthState {
	if (matchs([PATH_LOGOUT], action.path)) {
		return {
			synced: true,
			email: action.payload.email,
			loggedIn: false,
			password: "",
		}
	}

	if (matchs([PATH_LOGIN, PATH_SIGNUP], action.path)) {
		const success = action.type === CREATE_SUCCESS
		return {
			synced: true,
			email: action.payload.email,
			password: success ? action.payload.password : "",
			loggedIn: success,
		}
	}
	return state
}
