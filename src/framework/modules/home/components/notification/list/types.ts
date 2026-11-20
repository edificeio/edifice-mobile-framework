import type { SwipeRowAction } from '~/framework/components/list/swipeable';
import type { ITimelineNotification } from '~/framework/util/notifications';

export interface NotificationListProps {
  emptyTextsI18n: { text: string; title: string };
  getSwipeActions?: (notification: ITimelineNotification) => readonly SwipeRowAction[];
  loading: boolean;
  loadingMore: boolean;
  notifications: readonly ITimelineNotification[];
  onEndReached: () => void;
  onPressItem: (notification: ITimelineNotification) => void;
  onRefresh: () => void;
  onSwipeActiveChange?: (active: boolean) => void;
  // shows the placeholders of enriched notifications while the list loads.
  preview?: boolean;
  refreshing: boolean;
}
