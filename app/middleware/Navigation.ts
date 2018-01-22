import { CREATE_ERROR, CREATE_SUCCESS } from "../constants/docs"
import { PATH_LOGIN, PATH_LOGOUT, PATH_RECOVER_PASSWORD, PATH_SIGNUP } from "../constants/paths"
import { navigate } from "../utils/navHelper"

export default store => next => action => {
	const returnValue = next(action)

	if (action.path && (action.path === PATH_LOGIN || action.path === PATH_SIGNUP) && action.type === CREATE_SUCCESS) {
		navigate("Main")
	}

	// The auth flow should be refactored...Going back to login is a nightmare...
	if (action.path && action.path === PATH_RECOVER_PASSWORD && action.type === CREATE_SUCCESS) {
		navigate("Login")
	}

	if (action.path && action.path === PATH_LOGOUT) {
		navigate("Login", { email: action.payload.email })
	}

	return returnValue
}
