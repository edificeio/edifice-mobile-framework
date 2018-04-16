import CookieManager from 'react-native-cookies';
import { AsyncStorage } from "react-native";
import { setLogin } from "../../utils/Store";
import { clearConversation } from "../../conversation/actions";
import { Conf } from "../../Conf";
import { Tracking } from '../../tracking/TrackingManager';
import firebase from 'react-native-firebase';
import { clearTimeline } from '../../timeline/actions/clearTimeline';

export const logout = dispatch => async email => {
	await AsyncStorage.setItem('/userbook/api/person', '');
	setLogin({ email: email, password: "" });
	await fetch(`${Conf.platform}/auth/logout`);
	dispatch({ type: 'LOGOUT_AUTH', email: email });
	clearTimeline(dispatch)();
	clearConversation(dispatch)();
	const token = await firebase.messaging().getToken();
	fetch(`${ Conf.platform }/timeline/pushNotif/fcmToken?fcmToken=${ token }`, { method: 'delete' });
	Tracking.logEvent('logout', { email: email });
	CookieManager.clearAll();
}