import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';

export interface AuthOnboardingAddAccountScreenProps {
  // @scaffolder add props here
}

export interface AuthOnboardingAddAccountScreenNavParams {
  // @scaffolder add nav params here
}

export interface AuthOnboardingAddAccountScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, 'onboardingAddAccount'>,
    AuthOnboardingAddAccountScreenProps {
  // @scaffolder add HOC props here
}
