import type { ITimelineNotification } from '~/framework/util/notifications';

export interface NotificationListProps {
  notifications: ITimelineNotification[];
  loading: boolean;
  onEndReached: () => void;
  onPressItem: (notification: ITimelineNotification) => void;
  loadingMore: boolean;
}
