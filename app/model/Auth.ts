import { CREATE_SUCCESS, READ_SUCCESS } from "../constants/docs"
import { matchs, PATH_LOGIN, PATH_LOGOUT, PATH_SIGNUP } from "../constants/paths"
import { crudReducer } from "./docs"
import { Me } from '../infra/Me';

export interface IAuthModel {
	email: string
	password: string
	loggedIn: boolean
	synced: boolean
	userId: string
	error: string
}

export interface IAuthState extends IAuthModel {}

export const initialState: IAuthState = {
	email: "",
	loggedIn: false,
	password: "",
	synced: true,
	userId: null,
	error: ''
}

export function Auth(state: IAuthState = initialState, action): IAuthState {
	if (action.type === 'LOGOUT_AUTH') {
		return {
			...initialState,
			email: action.email
		}
	}

	if(action.type === 'LOGIN_ERROR_AUTH'){
		return {
			...initialState,
			loggedIn: false,
			error: action.error
		}
	}

	if(action.type === 'LOGIN_AUTH'){
		Me.session = action.userbook;
		return {
			...state,
			loggedIn: true,
			password: action.password,
			email: action.email,
			userId: action.userbook.id
		}
	}

	if (matchs([PATH_LOGIN, PATH_SIGNUP], action.path) && action.type === CREATE_SUCCESS) {
		return crudReducer(state, [PATH_LOGIN, PATH_SIGNUP], action, "-1")
	}

	return state
}
