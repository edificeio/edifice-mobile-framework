import { CREATE_SUCCESS, READ_SUCCESS } from '../constants/docs';
import { PATH_LOGOUT, PATH_RECOVER_PASSWORD, PATH_SIGNUP } from "../constants/paths"
import { navigate } from "../utils/navHelper"

export default store => next => action => {
	const returnValue = next(action);

	switch(action.type){
		case 'LOGOUT_AUTH':
			navigate("Login", { email: action.email });
			break;
	}

	if (!action.path) return returnValue

	return returnValue
}
