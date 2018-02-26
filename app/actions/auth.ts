import CookieManager from 'react-native-cookies';
import { PATH_AUTH, PATH_LOGIN, PATH_LOGOUT, PATH_RECOVER_PASSWORD, PATH_SIGNUP } from "../constants/paths"
import {create, createWithFormData} from "./docs"
import { setLogin } from "../utils/Store";
import { Conf } from "../Conf";
import { clearTimeline } from './timeline';
import { clearConversation } from './conversation';

console.log(Conf);

/**
 *
 * @param {string} email     login du user
 * @param {string} password     password du user
 * @param {boolean} synced    say if we put yourglass
 * @returns {PATH_LOGIN}
 */
export const login = (email, password) => {
	return createWithFormData(PATH_LOGIN, { email, password, rememberMe: true }, true) // create et non read pour recuperrer le password
}

export const logout = dispatch => async email => {
	setLogin({ email: email, password: "" });
	await fetch(`${Conf.platform}/auth/logout`);
	dispatch({ type: 'LOGOUT_AUTH', email: email });
	clearTimeline(dispatch)();
	clearConversation(dispatch)();
	CookieManager.clearAll();
}

/**
 * Enregistrement d'un user
 *
 * @param {string} email   login du user
 * @param {string} password   password du user
 * @returns {PATH_SIGNUP}
 */
export const signup = (email, password) => {
	return createWithFormData(PATH_SIGNUP, { email, password }, true)
}

/**
 * Recuperation du password du user
 *
 * @param {string } email     email du user
 * @returns {PATH_RECOVER_PASSWORD}
 */
export const recoverPassword = email => {
	return createWithFormData(PATH_RECOVER_PASSWORD, { email }, true)
}

/**
 * try to login
 * @returns {PATH_LOGIN}
 */
export const checkLogin = () => {
	return { type: PATH_AUTH }
}
