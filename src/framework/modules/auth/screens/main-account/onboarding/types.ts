import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';

export type AuthOnboardingScreenNavParams = undefined;

export type AuthOnboardingScreenProps = NativeStackScreenProps<AuthNavigationParams, 'onboarding'>;
