/**
 * CloudMessgaging
 * All tools to manage push-notifications opening
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export async function requestUserPermission() {
	const authorizationStatus = await messaging().requestPermission();
	if (authorizationStatus) {
		console.log('Permission status:', authorizationStatus);
	}
}

