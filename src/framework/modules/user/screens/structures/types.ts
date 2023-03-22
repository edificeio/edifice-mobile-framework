import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UserStructureWithClasses } from '~/framework/modules/auth/model';

import type { UserNavigationParams } from '../../navigation';

export interface UserStructuresScreenProps {}

export interface UserStructuresScreenNavParams {}

export interface UserStructuresScreenStoreProps {
  structures?: UserStructureWithClasses[];
}

export interface UserStructuresScreenDispatchProps {}

export interface UserStructuresScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'structures'>,
    UserStructuresScreenProps,
    UserStructuresScreenStoreProps,
    UserStructuresScreenDispatchProps {}
