import { initialState } from "../reducer";

export const LOGOUT_AUTH = (state, action) => ({
    ...initialState,
    email: action.email
});