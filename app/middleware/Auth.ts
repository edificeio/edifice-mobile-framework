import { login } from "../actions/auth"
import { error } from "../actions/docs"
import { CREATE_ERROR, CREATE_SUCCESS } from "../constants/docs"
import { PATH_AUTH, PATH_LOGIN, PATH_LOGOUT, PATH_RECOVER_PASSWORD, PATH_SIGNUP } from "../constants/paths"
import { navigate } from "../utils/navHelper"
import { getLogin, setLogin } from "../utils/Store"
import { readConversation, readNextConversation } from "../actions/conversation"
import { readCurrentUser } from "../actions/users"

let initAuth = false

async function auth(dispatch) {
	try {
		const { email = "", password = "" } = await getLogin()

		if (email && email.length > 0 && password.length > 0) {
			dispatch(login(email, password))
			return
		}

		navigate("Login", { email })
	} catch (e) {
		navigate("Login", { email: "" })
	}
}

export default store => next => action => {
	try {
		if (action.type === PATH_AUTH) {
			auth(store.dispatch)
			initAuth = true
		}

		const returnValue = next(action)

		if (action.path === PATH_LOGOUT || action.type === PATH_RECOVER_PASSWORD) {
			setLogin({ email: action.payload.email, password: "" })
		}

		if ((action.path === PATH_LOGIN || action.path === PATH_SIGNUP) && action.type === CREATE_SUCCESS) {
			setLogin({
				email: action.payload.email,
				password: action.payload.password,
			})

			store.dispatch(readCurrentUser())

			store.dispatch(readConversation())
            store.dispatch(readNextConversation(1))
            store.dispatch(readNextConversation(2))
            store.dispatch(readNextConversation(3))
            store.dispatch(readNextConversation(4))
            store.dispatch(readNextConversation(5))
            store.dispatch(readNextConversation(6))
            store.dispatch(readNextConversation(6))


			// read the data
		}

		if ((action.path === PATH_LOGIN || action.path === PATH_SIGNUP) && action.type === CREATE_ERROR) {
			setLogin({ email: "", password: "" })
		}
		return returnValue
	} catch (ex) {
		store.dispatch(error(-1, ex.message))
	}
}
