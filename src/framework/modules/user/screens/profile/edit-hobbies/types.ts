import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HobbieItem } from '~/framework/modules/user/model';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';

export interface UserEditHobbiesScreenDataProps {}

export interface UserEditHobbiesScreenEventProps {}

export interface UserEditHobbiesScreenNavParams {
  userId: string;
  hobbies: HobbieItem[];
}

export type UserEditHobbiesScreenProps = UserEditHobbiesScreenDataProps &
  UserEditHobbiesScreenEventProps &
  NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.editHobbies>;

export interface objectHobbies {
  [category: string]: {
    values: string;
    visibility: string;
  };
}
