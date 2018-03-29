import { CREATE_SUCCESS, READ_SUCCESS } from "../constants/docs"
import { matchs, PATH_LOGIN, PATH_LOGOUT, PATH_SIGNUP } from "../constants/paths";
import { Me } from '../infra/Me';

export interface User {
	displayName: string;
	userId: string;
}

export interface Group {
	name: string;
	id: string;
}

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
			userId: action.userbook.id,
			error: ''
		}
	}

	return state
}
