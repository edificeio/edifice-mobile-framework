import { CREATE_SUCCESS } from "../constants/docs"
import { PATH_LOGIN, PATH_LOGOUT, PATH_RECOVER_PASSWORD, PATH_SIGNUP } from "../constants/paths"
import { navigate } from "../utils/navHelper"

export default store => next => action => {
	const returnValue = next(action)

	if (!action.path) return returnValue

	switch (action.path) {
		case PATH_LOGIN:
		case PATH_SIGNUP:
			if (action.type === CREATE_SUCCESS) navigate("Main")
			break

		case PATH_RECOVER_PASSWORD:
		case PATH_LOGOUT:
			navigate("Login", { email: action.payload.email })
			break
	}

	return returnValue
}
