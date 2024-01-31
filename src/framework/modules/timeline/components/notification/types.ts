import { ITimelineNotification } from '~/framework/util/notifications';

export interface ITimelineNotificationProps {
  notification: ITimelineNotification;
  notificationAction?: () => void;
  testID?: string;
}
