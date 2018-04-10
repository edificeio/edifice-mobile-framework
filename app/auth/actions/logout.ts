import CookieManager from 'react-native-cookies';
import { AsyncStorage } from "react-native";
import { setLogin } from "../../utils/Store";
import { clearTimeline } from "../../actions/timeline";
import { clearConversation } from "../../conversation/actions";
import { Conf } from "../../Conf";
import { Tracking } from '../../tracking/TrackingManager';

export const logout = dispatch => async email => {
	await AsyncStorage.setItem('/userbook/api/person', '');
	setLogin({ email: email, password: "" });
	await fetch(`${Conf.platform}/auth/logout`);
	dispatch({ type: 'LOGOUT_AUTH', email: email });
	clearTimeline(dispatch)();
	clearConversation(dispatch)();
	Tracking.logEvent('logout', { email: email });
	CookieManager.clearAll();
}