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
			this.props.handleNotifications(JSON.parse(notification.data.params));
			Tracking.logEvent('openNotificationPush');
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
						if(currentState.routes && currentState.routes[0].routes && currentState.routes[0].routes[currentState.routes[0].index].index > 0){
							Tracking.logEvent('menuTab', { tab: currentState.routes[0].routes[currentState.routes[0].index].routeName })
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