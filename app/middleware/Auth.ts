import { checkLogin } from '../actions/auth'
import { error } from '../actions/docs'
import { CREATE_ERROR, CREATE_SUCCESS } from '../constants/docs'
import { PATH_LOGIN, PATH_LOGOUT, PATH_RECOVER_PASSWORD, PATH_SIGNUP } from '../constants/paths'
import { getLogin, setLogin } from '../utils/Store'

var initAuth = false

function auth(dispatch) {
    try {
        getLogin().then(({ username, password }) => {
            if (username.length > 0 && password.length > 0) dispatch(checkLogin(username, password))
        })
    } catch (ex) {}
}

export default store => next => action => {
    const returnValue = next(action)

    try {
        if (!initAuth) {
            auth(store.dispatch)
            initAuth = true
        }

        if (action.type === PATH_LOGOUT || action.type === PATH_RECOVER_PASSWORD) {
            setLogin({ username: '', password: '' })
        }

        if ((action.path === PATH_LOGIN || action.path === PATH_SIGNUP) && action.type === CREATE_SUCCESS) {
            setLogin({ username: action.payload.username, password: action.payload.password })
        }

        if ((action.path === PATH_LOGIN || action.path === PATH_SIGNUP) && action.type === CREATE_ERROR) {
            setLogin({ username: '', password: '' })
        }
        return returnValue
    } catch (ex) {
        store.dispatch(error(-1, ex.message))
    }
}
