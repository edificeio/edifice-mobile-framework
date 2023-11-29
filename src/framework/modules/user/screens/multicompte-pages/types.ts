import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface UserMulticomptePagesScreenProps {}

export interface UserMulticomptePagesScreenNavParams {}

export interface UserMulticomptePagesScreenStoreProps {
  session?: ISession;
}

export interface UserMulticomptePagesScreenDispatchProps {}

export interface UserMulticomptePagesScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'whoAreWe'>,
    UserMulticomptePagesScreenProps,
    UserMulticomptePagesScreenStoreProps,
    UserMulticomptePagesScreenDispatchProps {}
