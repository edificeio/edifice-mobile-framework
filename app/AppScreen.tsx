import * as React from "react"
import { StatusBar, View } from "react-native"
import SplashScreen from "react-native-smart-splash-screen";
import { CommonStyles } from "./styles/common/styles"
import { AppNavigator } from "./navigation/AppNavigator"
import { Tracking } from "./tracking/TrackingManager"
import ProgressBar from "./ui/ProgressBar";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import { readCurrentUser } from './auth/actions/login';
import { Conf } from "./Conf";
import pushNotifications from "./pushNotifications";

function getCurrentRoute(navigationState) {
	if (!navigationState) {
		return null
	}
	const route = navigationState.routes[navigationState.index]
	if (route.routes) {
		return getCurrentRoute(route)
	}
	return route
}

export let navigationRef = null

export class AppScreen extends React.Component<any, undefined> {
	navigator: any;
	notificationDisplayedListener;

	async componentDidMount() {
		navigationRef = this.navigator;
		SplashScreen.close({
			animationType: SplashScreen.animationType.scale,
			delay: 500,
			duration: 850,
		});

		const notificationOpen = await firebase.notifications().getInitialNotification();
		if (notificationOpen) {
			await this.props.readCurrentUser();
			const action = notificationOpen.action;
			const notification = notificationOpen.notification;
			this.props.handleNotifications(notification.data)
		}
	}

	setNavigator(nav){
		this.navigator = nav;
	}
	public render() {
		return (
			<View style={{ flex: 1 }}>
				<StatusBar backgroundColor={CommonStyles.statusBarColor} barStyle="light-content" />
				<ProgressBar />
				<AppNavigator
					onNavigationStateChange={(prevState, currentState) => {
						const currentRoute = getCurrentRoute(currentState)
						const prevRoute = getCurrentRoute(prevState)

						if (prevRoute.routeName !== currentRoute.routeName) {
							Tracking.trackScreenView(currentRoute.routeName, currentRoute.params)
						}
					}}
					ref={nav => this.setNavigator(nav)}
				/>
			</View>
		)
	}
}

export default connect(
	state => ({}),
	dispatch => ({
		readCurrentUser: notifData => readCurrentUser(dispatch)(),
		handleNotifications: data => pushNotifications(dispatch)(data)
	})
)(AppScreen);