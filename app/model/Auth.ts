import {
    matchs, PATH_LOGIN
} from '../constants/paths'
import {CREATE_SUCCESS} from "../constants/docs";


const initialState = {
    email: '',
    password: '',
    loggedIn: false,
    synced: true,
}


export function Auth(state = initialState, action) {
    if (matchs([PATH_LOGIN], action.path) && action.type === CREATE_SUCCESS ) {
        const newState = {...state};

        newState.email = action.payload.email;
        newState.password = action.payload.password;
        newState.loggedIn = true;
        newState.synced = true;

        return newState;
    }

    return state;
}
