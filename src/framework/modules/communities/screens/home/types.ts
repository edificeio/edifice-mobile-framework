import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export interface CommunitiesHomeScreenProps {}

export interface CommunitiesHomeScreenNavParams {}

export interface CommunitiesHomeScreenPrivateProps
  extends NativeStackScreenProps<CommunitiesNavigationParams, 'home'>,
    CommunitiesHomeScreenProps {}
