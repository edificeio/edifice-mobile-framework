import CookieManager from 'react-native-cookies';
import { PATH_AUTH, PATH_LOGIN, PATH_LOGOUT, PATH_RECOVER_PASSWORD, PATH_SIGNUP } from "../constants/paths";
import { setLogin } from "../utils/Store";
import { Conf } from "../Conf";
import { clearTimeline } from './timeline';
import { Me } from '../infra/Me';
import { read } from '../infra/Cache';
import { AsyncStorage, Platform } from 'react-native';
import { tr } from '../i18n/t';
import { navigate } from '../utils/navHelper';
import I18n from 'react-native-i18n';
import { clearConversation } from '../conversation/actions';

console.log(Conf);

export const readCurrentUser = dispatch => async () => {
    const userinfo = await read('/userbook/api/person');
    
    dispatch({
        type: "LOGIN_AUTH",
        loggedIn: true,
		userbook: userinfo.result["0"]
    })

    console.log('Navigating to main');
	navigate("Main");
}

const getFormData = data => {
	if (typeof data === "string") {
		return data
	}

	const formData = new FormData()

	for (const name in data) {
		if (name !== "formData") {
			const value = data[name]
			if (value instanceof Array) {
				value.map((val, i) => {
					formData.append(`${name}[]`, val)
				})
			} else {
				formData.append(name, value)
			}
		}
	}
	return formData
}

async function getCookies(response) {
	const cookie = response.headers.get("Set-Cookie")
	if (cookie) return new Promise(resolve => resolve(cookie))
	return await AsyncStorage.getItem("Set-Cookie")
}

export const login = dispatch => async (email, password) => {
	const formData = new FormData();
	formData.append('email', email);
	formData.append('password', password);
	formData.append('rememberMe', 'true');

	const opts = {
		body: formData,
		headers: new Headers({
			"Content-type": "multipart/form-data",
		}),
		method: 'post'
	}

	try{
		const response = await fetch(`${ Conf.platform }/auth/login`, opts);
		const data = await response.text();

		if (data.indexOf('/auth') !== -1 && data.indexOf('error') !== -1) {
			dispatch({
				type: 'LOGIN_ERROR_AUTH',
				error: tr.Incorrect_login_or_password,
			});
		}
		else{
			const cookies = getCookies(response);
			// Cookie are not persist on IOS so we use AsyncStorage here
			if (Platform.OS === "ios") {
				AsyncStorage.setItem("Set-Cookie", JSON.stringify(cookies))
			}

			setLogin({
				email: email,
				password: password
			});

			await readCurrentUser(dispatch)();
		}
	}
	catch(e){
		dispatch({
			type: 'LOGIN_ERROR_AUTH',
			error: I18n.t('auth-networkError')
		});
	}
	
}

let dataFilled = false;
export const fillUserData = async () => {
	if(dataFilled){
		return;
	}
	const data = await read(`/directory/user/${ Me.session.userId }`);
	for(let prop in data){
		Me.session[prop] = data[prop];
	}
	dataFilled = true;
}

export const logout = dispatch => async email => {
	await AsyncStorage.setItem('/userbook/api/person', '');
	setLogin({ email: email, password: "" });
	await fetch(`${Conf.platform}/auth/logout`);
	dispatch({ type: 'LOGOUT_AUTH', email: email });
	clearTimeline(dispatch)();
	clearConversation(dispatch)();
	CookieManager.clearAll();
}

export const clearForm = dispatch => () => {
	dispatch({ type: 'CLEAR_FORM_AUTH' });
}

/**
 * try to login
 * @returns {PATH_LOGIN}
 */
export const checkLogin = () => {
	return { type: PATH_AUTH }
}
