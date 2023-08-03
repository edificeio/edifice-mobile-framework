import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';

export interface UserEditMoodMottoScreenDataProps {}

export interface UserEditMoodMottoScreenEventProps {}

export interface UserEditMoodMottoScreenNavParams {
  userId: string;
  mood: string;
  motto: string;
}

export type UserEditMoodMottoScreenProps = UserEditMoodMottoScreenDataProps &
  UserEditMoodMottoScreenEventProps &
  NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.editMoodMotto>;
