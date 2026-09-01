import type { ColorValue } from 'react-native';

import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SharedValue } from 'react-native-reanimated';

import type { SvgIconName } from '~/framework/components/picture';
import type { ITimelineNotification } from '~/framework/util/notifications';

export interface SwipeActionProps {
  color: ColorValue;
  filled?: boolean;
  icon: SvgIconName;
  label: string;
  onPress: () => void;
  // goes from 0 to 1 as the row uncovers the action.
  progress: SharedValue<number>;
}

export interface NotificationRowProps {
  item: ITimelineNotification;
  canDelete: boolean;
  canReport: boolean;
  isRowOpened: boolean;
  someRowOpen: boolean;
  onClose: (id: string) => void;
  onDelete: (id: string) => void;
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
  onDeleteItem: (id: string) => Promise<void>;
  onEndReached: () => void;
  onPressItem: (notification: ITimelineNotification) => void;
  onReportItem: (notification: ITimelineNotification) => Promise<boolean>;
  onSwipeActiveChange?: (active: boolean) => void;
  canReport: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  userId: string;
}
