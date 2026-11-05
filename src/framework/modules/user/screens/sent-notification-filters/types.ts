import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface UserSentNotificationFiltersScreenProps {}

export interface UserSentNotificationFiltersScreenNavParams {}

export interface UserSentNotificationFiltersScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'sentNotificationsFilters'>, UserSentNotificationFiltersScreenProps {}
