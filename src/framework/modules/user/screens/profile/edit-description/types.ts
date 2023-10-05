import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';

export interface UserEditDescriptionScreenDataProps {}

export interface UserEditDescriptionScreenEventProps {}

export interface UserEditDescriptionScreenNavParams {
  userId: string;
  description: string;
  visibility: boolean | undefined;
}

export type UserEditDescriptionScreenProps = UserEditDescriptionScreenDataProps &
  UserEditDescriptionScreenEventProps &
  NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.editDescription>;
