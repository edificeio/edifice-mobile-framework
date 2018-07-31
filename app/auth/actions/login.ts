import { read } from "../../infra/Cache";
import { navigate } from "../../utils/navHelper";
import { AsyncStorage, Platform } from "react-native";
import { Conf } from "../../Conf";
import { setLogin } from "../../utils/Store";
import I18n from 'react-native-i18n';
import { Tracking } from '../../tracking/TrackingManager';
import firebase from "react-native-firebase";

export const readCurrentUser = dispatch => async () => {
    const userinfo = await read('/userbook/api/person', false);
    
    dispatch({
        type: "LOGIN_AUTH",
        loggedIn: true,
		userbook: userinfo.result["0"]
    })

	const notificationOpen = await firebase.notifications().getInitialNotification();
	if (!notificationOpen) {
		console.log('Navigating to main');
		navigate("Main");
	}
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

export enum LoginResult{ success, passwordError, connectionError }

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
				error: I18n.t('auth-loginFailed'),
			});

            Tracking.logEvent('failedLogin', { email: email });
			return LoginResult.passwordError;
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

			const token = await firebase.messaging().getToken();
			fetch(`${ Conf.platform }/timeline/pushNotif/fcmToken?fcmToken=${ token }`, { method: 'put' });

			await readCurrentUser(dispatch)();
			Tracking.logEvent('login', { email: email });
			
			return LoginResult.success;
		}
	}
	catch(e){
		dispatch({
			type: 'LOGIN_ERROR_AUTH',
			error: I18n.t('auth-networkError')
		});

		return LoginResult.connectionError;
	}
	
}

export const clearForm = dispatch => () => {
	dispatch({ type: 'CLEAR_FORM_AUTH' });
}