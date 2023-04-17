import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThunkDispatch } from 'redux-thunk';

import { AuthRouteNames, IAuthNavigationParams } from '~/framework/modules/auth/navigation';

export interface IOnboardingScreenProps extends NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.onboarding> {
  dispatch: ThunkDispatch<any, any, any>;
}

export interface IOnboardingScreenState {
  buttonsWidth: number;
}
