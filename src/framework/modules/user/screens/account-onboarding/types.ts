import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface UserAccountOnboardingScreenProps {}

export interface UserAccountOnboardingScreenNavParams {}

export interface UserAccountOnboardingScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'accountOnboarding'>,
    UserAccountOnboardingScreenProps {}
