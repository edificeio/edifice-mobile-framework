import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HobbieItem } from '~/framework/modules/user/model';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';

export interface UserEditDescriptionScreenDataProps {}

export interface UserEditDescriptionScreenEventProps {}

export interface UserEditDescriptionScreenNavParams {
  userId: string;
  description: string;
  visibility: boolean | undefined;
  mood?: string;
  motto?: string;
  hobbies?: HobbieItem[];
}

export type UserEditDescriptionScreenProps = UserEditDescriptionScreenDataProps &
  UserEditDescriptionScreenEventProps &
  NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.editDescription>;
