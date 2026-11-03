import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface UserSentNotificationsScreenProps {}

export interface UserSentNotificationsScreenNavParams {}

export interface UserSentNotificationsScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'sentNotifications'>, UserSentNotificationsScreenProps {}
