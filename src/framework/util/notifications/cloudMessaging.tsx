/**
 * CloudMessgaging
 * All tools to manage push-notifications opening
 */

import React, { useState, useEffect, FunctionComponent } from 'react';
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import SplashScreen from "react-native-splash-screen";

import { defaultNotificationActionStack, handleNotificationAction } from "./routing";
import { IEntcoreTimelineNotification, notificationAdapter } from '.';
import { startLoadNotificationsAction } from '~/framework/modules/timelinev2/actions';

export async function requestUserPermission() {
	const authorizationStatus = await messaging().requestPermission();

	if (authorizationStatus) {
		console.log('Permission status:', authorizationStatus);
	}
}

const _AppPushNotificationHandlerComponent: FunctionComponent<{ isLoggedIn: boolean, apps: string[], dispatch: ThunkDispatch<any, any, any> }> = (props) => {
	const [notification, setNotification] = useState<FirebaseMessagingTypes.RemoteMessage | undefined>(undefined);

	useEffect(() => {
		// Assume a message-notification contains a "type" property in the data payload of the screen to open

		messaging().onNotificationOpenedApp(remoteMessage => {
			console.log(
				'Notification caused app to open from background state:',
				remoteMessage,
			);
			setNotification(remoteMessage);
		});

		// Check whether an initial notification is available
		messaging()
			.getInitialNotification()
			.then(remoteMessage => {
				if (remoteMessage) {
					console.log(
						'Notification caused app to open from quit state:',
						remoteMessage.notification,
					);
					setNotification(remoteMessage);
				}
			});
	}, []);

	if (notification && props.isLoggedIn) {
		console.log('Handling notification:', notification);
		if (notification.data) {
			const notificationData = {
				...notification.data, params: notification.data.params && JSON.parse(notification.data.params)
			} as IEntcoreTimelineNotification;
			const n = notificationAdapter(notificationData);

			props.dispatch(startLoadNotificationsAction()); // Lasy-load, no need to await here.
			props.dispatch(handleNotificationAction(n, defaultNotificationActionStack, "Push Notification"))
			setNotification(undefined);
		}
		SplashScreen.hide();
	}

	return <>{props.children}</>;
}

const mapStateToProps: (s: any) => any = (s) => {
	return {
		isLoggedIn: s?.user?.auth?.loggedIn,
		apps: s?.user?.auth?.apps
	};
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => ({
	dispatch
});

export const AppPushNotificationHandlerComponent = connect(mapStateToProps, mapDispatchToProps)(_AppPushNotificationHandlerComponent);
