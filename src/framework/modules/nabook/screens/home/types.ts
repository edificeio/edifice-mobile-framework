import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { NabookNavigationParams } from '~/framework/modules/nabook/navigation';

export interface NabookHomeScreenProps {}

export interface NabookHomeScreenNavParams {}

export interface NabookHomeScreenPrivateProps
  extends NativeStackScreenProps<NabookNavigationParams, 'home'>,
    NabookHomeScreenProps {}
