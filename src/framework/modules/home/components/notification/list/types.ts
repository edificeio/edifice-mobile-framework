import type { ITimelineNotification } from '~/framework/util/notifications';

export interface NotificationListProps {
  notifications: ITimelineNotification[];
  onEndReached: () => void;
  onPressItem: (notification: ITimelineNotification) => void;
}
