import * as reducerActions from './reducerActions';

export interface User { 
    userId: string,
    displayName: string
}
export interface Group { 
    id: string,
    name: string
}

export interface AuthState {
	email: string
	password: string
	loggedIn: boolean
	synced: boolean
	userId: string
    error: string
    notificationsPrefs: any
}

export const initialState: AuthState = {
	email: "",
	loggedIn: false,
	password: "",
	synced: true,
	userId: null,
    error: '',
    notificationsPrefs: []
}

export default (state: AuthState = initialState, action): AuthState => {
    for(let actionType in reducerActions){
        if(action.type === actionType){
            return reducerActions[actionType](state, action);
        }
    }

	return {
        ...state
    }
}