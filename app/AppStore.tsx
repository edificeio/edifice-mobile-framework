import * as React from "react";
import { Provider } from "react-redux";
import AppScreen from "./AppScreen";
import { applyMiddleware, createStore, combineReducers } from "redux";
import { middleware } from "./navigation/middleware";
import I18n, { getLanguages } from "react-native-i18n";
import auth from './auth/reducer';
import conversation from './conversation/reducer';
import timeline from './timeline/reducer';
import connectionTracker from './infra/reducers/connectionTracker';
import ui from './infra/reducers/ui';

const reducers = combineReducers({
	auth: auth,
	conversation: conversation,
	timeline: timeline,
	connectionTracker: connectionTracker,
	ui: ui
});

const enhancer = applyMiddleware(middleware);
const store = createStore(reducers, enhancer);

I18n.fallbacks = true;
I18n.translations = {
	en: require("../assets/i18n/en"),
	es: require("../assets/i18n/es"),
	fr: require("../assets/i18n/fr"),
}
I18n.defaultLocale = "en"

getLanguages();

export class AppStore extends React.Component {
	componentDidMount(){
		store.dispatch({ type: 'CHECK_LOGIN_AUTH' });
	}
	
	public render() {
		return (
			<Provider store={store}>
				<AppScreen />
			</Provider>
		)
	}
}
