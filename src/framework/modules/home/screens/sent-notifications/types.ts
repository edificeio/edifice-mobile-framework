import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { NotificationFilterSelection } from '~/framework/modules/home/templates/notification-filters';
import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export namespace HomeSentNotificationsScreen {
  export interface NavParams {
    // set by the filters screen when it saves a new selection.
    selection?: NotificationFilterSelection;
  }
  export type NavigationProps = NativeStackScreenProps<UserNavigationParams, 'sentNotifications'>;
  export type AllProps = HomeSentNotificationsScreen.NavigationProps;
}
