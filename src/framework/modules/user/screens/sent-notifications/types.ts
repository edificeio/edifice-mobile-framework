import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export namespace UserSentNotificationsScreen {
  export interface NavParams {}
  export type NavigationProps = NativeStackScreenProps<UserNavigationParams, 'sentNotifications'>;
  export type AllProps = UserSentNotificationsScreen.NavigationProps;
}
