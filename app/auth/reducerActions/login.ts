import { Me } from "../../infra/Me";

export const LOGIN_AUTH = (state, action) => {
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