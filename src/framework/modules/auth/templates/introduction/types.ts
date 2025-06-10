import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';
import { StackNavigationAction } from '~/framework/navigation';

export interface AuthIntroductionScreenProps {
  nextScreenAction: StackNavigationAction;
  svgName: string;
  title: string;
  description: string;
  buttonText: string;
}

export type AuthIntroductionScreenNavParams = undefined;

export interface AuthIntroductionScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams>,
    AuthIntroductionScreenProps {}
