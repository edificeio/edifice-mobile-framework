import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export type ChildrenDataByStructures = {
  structureName: string;
  data: {
    displayName: string;
    id: string;
  }[];
}[];

export interface UserFamilyScreenDispatchProps {}

export interface UserFamilyScreenNavParams {
  mode: 'children' | 'relatives';
}

export interface UserFamilyScreenProps {}

export interface UserFamilyScreenStoreProps {
  session: ISession | undefined;
}

export interface UserFamilyScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'family'>,
    UserFamilyScreenProps,
    UserFamilyScreenStoreProps,
    UserFamilyScreenDispatchProps {}
