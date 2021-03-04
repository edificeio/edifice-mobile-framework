/**
 * CloudMessgaging
 * All tools to manage push-notifications opening
 */

import React, { useState, useEffect, FunctionComponent } from 'react';
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import SplashScreen from "react-native-splash-screen";

import { handleNotificationAction, NotifHandlerThunkAction } from "./routing";
import { getAsResourceUriNotification, IEntcoreTimelineNotification, ITimelineNotification, notificationAdapter } from '.';
import { legacyAppConf } from '../appConf';
import { Linking } from 'react-native';

export async function requestUserPermission() {
	const authorizationStatus = await messaging().requestPermission();

	if (authorizationStatus) {
		console.log('Permission status:', authorizationStatus);
	}
}

const fallbackHandleNotificationAction: NotifHandlerThunkAction = n => async (dispatch, getState) => {
	if (!legacyAppConf.currentPlatform)
		throw new Error("[cloudMessaging] Must have a platform selected to redirect the user");

	const notifWithUri = getAsResourceUriNotification(n);
	if (!notifWithUri) {
		console.log(`[cloudMessaging] notification ${n.type}.${n["event-type"]} has no resource uri.`);
		return {
			managed: false,
		};
	}
	const url = `${legacyAppConf.currentPlatform.url}${notifWithUri.resource.uri}`;
	const notifPathBegin = '/' + notifWithUri.resource.uri.replace(/^\/+/g, '').split('/')[0];
	console.log("[cloudMessaging] Redirect to ", url);
	Linking.canOpenURL(url).then(supported => {
		if (supported) {
			Linking.openURL(url);
		} else {
			console.warn("[cloudMessaging] Don't know how to open URL: ", url);
		}
	});
	return {
		managed: true,
		trackInfo: { action: "Browser" }
	};
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

			props.dispatch(handleNotificationAction(n, fallbackHandleNotificationAction, "Push Notification"))
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
