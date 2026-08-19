import type { ITimelineNotification } from '~/framework/util/notifications';

export interface NotificationCardProps {
  notification: ITimelineNotification;
  onPress?: () => void;
}
