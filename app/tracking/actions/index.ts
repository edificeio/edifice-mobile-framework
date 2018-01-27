import { CREATE_ERROR, CREATE_SUCCESS } from "../../constants/docs"
import { PATH_LOGIN, PATH_LOGOUT } from "../../constants/paths"

import login from "./login"
import logout from "./logout"

export default {
	[`${CREATE_SUCCESS}${PATH_LOGIN}`]: login,
	[`${CREATE_SUCCESS}${PATH_LOGOUT}`]: logout,
}
