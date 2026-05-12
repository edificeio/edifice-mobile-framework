import { PartialRoute, Route } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';

export interface AuthIntroductionScreenProps {
  nextScreenAction: PartialRoute<Route<'auth/add-account/platforms' | 'auth/add-account/login'>>;
  svgName: string;
  title: string;
  description: string;
  buttonText: string;
}

export type AuthIntroductionScreenNavParams = undefined;

export interface AuthIntroductionScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams>, AuthIntroductionScreenProps {}
