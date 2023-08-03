import PushNotificationIOS from '@react-native-community/push-notification-ios';

let currentBadgeValue: number;

export function setCurrentBadgeValue(value: number) {
  currentBadgeValue = value;
  PushNotificationIOS.setApplicationIconBadgeNumber(value);
}

export function getCurrentBadgeValeu() {
  return currentBadgeValue;
}
