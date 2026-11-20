import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export namespace UserSentNotificationFiltersScreen {
  export interface NavParams {}
  export type NavigationProps = NativeStackScreenProps<UserNavigationParams, 'sentNotificationsFilters'>;
  export type AllProps = UserSentNotificationFiltersScreen.NavigationProps;
}
