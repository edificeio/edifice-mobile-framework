import { CommonActions, StackActionType } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthNavigationTemplatesParams } from '~/framework/modules/auth/navigation';

export interface AuthOnboardingScreenProps {
  pictures: any[];
  texts: string[];
  nextScreenAction: CommonActions.Action | StackActionType;
}

export type AuthOnboardingScreenNavParams = undefined;

export interface AuthOnboardingScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationTemplatesParams, 'onboarding'>,
    AuthOnboardingScreenProps {}

export interface AuthOnboardingScreenState {
  buttonsWidth: number;
}
