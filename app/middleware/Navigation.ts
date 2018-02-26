import { CREATE_SUCCESS, READ_SUCCESS } from '../constants/docs';
import { PATH_LOGIN, PATH_LOGOUT, PATH_RECOVER_PASSWORD, PATH_SIGNUP, PATH_CURRENT_USER } from "../constants/paths"
import { navigate } from "../utils/navHelper"

export default store => next => action => {
	const returnValue = next(action);

	switch(action.type){
		case 'LOGOUT_AUTH':
			navigate("Login", { email: action.email });
			break;
	}

	if (!action.path) return returnValue

	

	switch (action.path) {
		case PATH_CURRENT_USER:
			if (action.type === READ_SUCCESS) navigate("Main")
			break
	}

	return returnValue
}
