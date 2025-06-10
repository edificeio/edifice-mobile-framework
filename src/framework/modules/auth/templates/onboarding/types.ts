import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthNavigationTemplatesParams } from '~/framework/modules/auth/navigation';
import { StackNavigationAction } from '~/framework/navigation';

export interface AuthOnboardingScreenProps {
  pictures: any[];
  texts: string[];
  nextScreenAction: StackNavigationAction | StackNavigationAction[];
}

export type AuthOnboardingScreenNavParams = undefined;

export interface AuthOnboardingScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationTemplatesParams, 'onboarding'>,
    AuthOnboardingScreenProps {}

export interface AuthOnboardingScreenState {
  buttonsWidth: number;
}
