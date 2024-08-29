import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface DebugScreenProps {}

export interface DebugScreenNavParams {}

export interface DebugScreenStoreProps {}

export interface DebugScreenDispatchProps {}

export interface DebugScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'debug'>,
    DebugScreenProps,
    DebugScreenStoreProps,
    DebugScreenDispatchProps {}
