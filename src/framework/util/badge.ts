import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

let currentBadgeValue: number;

export function setCurrentBadgeValue(value: number) {
  if (Platform.OS !== 'ios') return;
  currentBadgeValue = value;
  PushNotificationIOS.setApplicationIconBadgeNumber(value);
}

export function getCurrentBadgeValue() {
  return currentBadgeValue;
}
