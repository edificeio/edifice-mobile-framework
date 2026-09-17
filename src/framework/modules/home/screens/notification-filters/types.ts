import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SvgIconName } from '~/framework/components/picture';
import type { NotificationFilter } from '~/framework/modules/timeline/reducer/notif-definitions/notif-filters';
import type { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

export type NotificationFiltersScreenProps = NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.NotificationFilters>;

export interface NotificationFilterItem {
  color?: string;
  filter: NotificationFilter;
  icon?: SvgIconName;
}

export interface NotificationFilterRowProps extends NotificationFilterItem {
  checked: boolean;
  onPress: (filter: NotificationFilter) => void;
}
