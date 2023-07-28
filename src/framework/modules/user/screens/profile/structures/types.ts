import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UserStructureWithClasses } from '~/framework/modules/auth/model';
import type { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';

export interface UserStructuresScreenProps {}

export interface UserStructuresScreenEventProps {}

export interface UserStructuresScreenNavParams {
  structures: UserStructureWithClasses[];
}

export type UserStructuresScreenPrivateProps = UserStructuresScreenProps &
  UserStructuresScreenEventProps &
  NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.structures>;
