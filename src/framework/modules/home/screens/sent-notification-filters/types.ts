import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { NotificationFilterSelection } from '~/framework/modules/home/templates/notification-filters';
import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export namespace HomeSentNotificationFiltersScreen {
  export interface NavParams {
    // the selection the list is showing, unset until its first page is loaded.
    selection?: NotificationFilterSelection;
  }
  export type NavigationProps = NativeStackScreenProps<UserNavigationParams, 'sentNotificationsFilters'>;
  export type AllProps = HomeSentNotificationFiltersScreen.NavigationProps;
}
