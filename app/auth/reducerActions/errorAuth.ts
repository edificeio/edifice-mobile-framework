import { initialState } from "../reducer";

export const LOGIN_ERROR_AUTH = (state, action) => ({
    ...initialState,
    loggedIn: false,
    error: action.error
});