import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SharedValue } from 'react-native-reanimated';

import type { ITimelineNotification } from '~/framework/util/notifications';

export interface ReportActionProps {
  onPress: () => void;
  // goes from 0 to 1 as the row uncovers the action.
  progress: SharedValue<number>;
}

export interface NotificationRowProps {
  item: ITimelineNotification;
  canReport: boolean;
  opened: boolean;
  someRowOpen: boolean;
  onClose: (id: string) => void;
  onOpen: (id: string) => void;
  onPress: (notification: ITimelineNotification) => void;
  onRef: (id: string, row: SwipeableMethods | null) => void;
  onReport: (notification: ITimelineNotification) => void;
  onSwipeActive: (active: boolean) => void;
  onWillOpen: (id: string) => void;
}

export interface NotificationListProps {
  notifications: ITimelineNotification[];
  loading: boolean;
  onEndReached: () => void;
  onPressItem: (notification: ITimelineNotification) => void;
  onReportItem: (notification: ITimelineNotification) => Promise<boolean>;
  onSwipeActiveChange?: (active: boolean) => void;
  canReport: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}
